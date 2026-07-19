import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tabs,
  Typography,
  message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  FiCreditCard,
  FiPlus,
  FiPrinter,
  FiSearch,
  FiTrash2,
  FiDownload,
  FiSettings
} from "react-icons/fi";
import dayjs from "dayjs";
import api from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { ShimmerTable } from "../components/ShimmerLoading.jsx";
import { printExactElement } from "../utils/printElement.js";
import { useAuth } from "../context/AuthContext.jsx";
import React from "react";

const RECEIPT_PAGE_STYLES = `
  @page { size: A4 portrait; margin: 0; }

  html,
  body.biit-print-body {
    width: 210mm;
    min-height: 297mm;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body.biit-print-body {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif !important;
  }

  .biit-print-stage {
    width: 210mm;
    min-height: 297mm;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 8mm;
    background: #ffffff;
  }

  .biit-print-stage .receipt-print {
    width: 194mm !important;
    max-width: none !important;
    margin: 0 !important;
    box-shadow: none !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .biit-print-stage .receipt-print,
  .biit-print-stage .receipt-print * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"].map(
  (value) => ({ value }),
);
const paymentStatuses = [
  "Paid",
  "Pending",
  "Partial",
  "Cancelled",
  "Refunded",
].map((value) => ({ value }));

const statusColor = (status) => {
  if (status === "Paid") return "green";
  if (status === "Pending") return "gold";
  if (status === "Partial") return "blue";
  if (status === "Cancelled" || status === "Refunded") return "red";
  return "default";
};

// Excel / CSV Export Utility
const exportToCSV = (data, columns, filename) => {
  if (!data || !data.length) {
    message.warning('No data to export');
    return;
  }
  const exportCols = columns.filter(c => c.title !== 'Action');
  const headers = exportCols.map(c => c.title).join(',');
  const rows = data.map(row => {
    return exportCols.map(c => {
      let val = '';
      if (c.exportRender) {
         val = c.exportRender(row);
      } else if (c.dataIndex) {
        if (Array.isArray(c.dataIndex)) {
          val = c.dataIndex.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), row);
        } else {
          val = row[c.dataIndex];
        }
      }
      if (val === null || val === undefined) val = '';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export default function Payments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [payments, setPayments] = useState([]);
  const [duesData, setDuesData] = useState([]);
  const [students, setStudents] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  
  const [open, setOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  
  const [filters, setFilters] = useState({ search: "", mode: "", status: "" });
  const [duesFilters, setDuesFilters] = useState({ month: dayjs(), status: "", batch: "", search: "" });
  const [perDayFine, setPerDayFine] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [duesLoading, setDuesLoading] = useState(false);
  
  const [form] = Form.useForm();
  const [settingForm] = Form.useForm();
  const receiptRef = useRef(null);

  const loadData = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const [paymentRes, studentRes, batchRes, settingRes] = await Promise.all([
        api.get("/payments", { params: nextFilters }),
        api.get("/students"),
        api.get('/courses/batches/list'),
        api.get('/payments/settings')
      ]);
      setPayments(paymentRes.data);
      setStudents(studentRes.data);
      setBatchOptions(batchRes.data.map(b => b.name).filter(Boolean));
      setPerDayFine(settingRes.data.perDayFine || 0);
      settingForm.setFieldsValue({ perDayFine: settingRes.data.perDayFine || 0 });
      
      if (!selected && paymentRes.data[0]) setSelected(paymentRes.data[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadDues = async (nextFilters = duesFilters) => {
    setDuesLoading(true);
    try {
      const { data } = await api.get('/payments/dues', {
        params: {
          month: nextFilters.month.format('YYYY-MM'),
          status: nextFilters.status,
          batch: nextFilters.batch,
          search: nextFilters.search
        }
      });
      setDuesData(data);
    } catch (error) {
      message.error('Failed to load dues tracking data');
    } finally {
      setDuesLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => message.error("Payments loading failed"));
    loadDues().catch(() => message.error("Dues loading failed"));
  }, []);

  const savePayment = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        month: values.month ? values.month.format('YYYY-MM') : dayjs().format('YYYY-MM'),
        paidDate: values.paidDate?.toISOString(),
      };
      const { data } = await api.post("/payments", payload);
      message.success("Payment receipt generated");
      setOpen(false);
      form.resetFields();
      setSelected(data);
      loadData(filters);
      loadDues(duesFilters);
    } catch (error) {
      if (!error.errorFields) message.error(error?.response?.data?.message || "Payment save failed");
    }
  };

  const saveSetting = async () => {
    try {
      const values = await settingForm.validateFields();
      await api.put('/payments/settings', { perDayFine: values.perDayFine });
      message.success('Fine settings updated');
      setPerDayFine(values.perDayFine);
      setSettingOpen(false);
      loadDues(duesFilters);
    } catch (error) {
      if (!error.errorFields) message.error("Setting save failed");
    }
  };

  const applyFilter = (patch) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    loadData(nextFilters).catch(() => message.error("Payments loading failed"));
  };

  const applyDuesFilter = (patch) => {
    const nextFilters = { ...duesFilters, ...patch };
    setDuesFilters(nextFilters);
    loadDues(nextFilters);
  };

  const updatePaymentStatus = async (payment, status) => {
    try {
      const { data } = await api.put(`/payments/${payment._id}`, { status });
      message.success("Payment status updated");
      setPayments((prev) => prev.map((item) => (item._id === payment._id ? data : item)));
      if (selected?._id === payment._id) setSelected(data);
      loadDues(duesFilters);
    } catch (error) {
      message.error(error?.response?.data?.message || "Status update failed");
    }
  };

  const deletePayment = async (payment) => {
    try {
      await api.delete(`/payments/${payment._id}`);
      message.success("Payment deleted");
      if (selected?._id === payment._id) setSelected(null);
      loadData(filters);
      loadDues(duesFilters);
    } catch (error) {
      message.error(error?.response?.data?.message || "Payment delete failed");
    }
  };

  const openPaymentModal = (dueRow = null) => {
    if (dueRow) {
      form.setFieldsValue({
        student: dueRow.student._id,
        amount: dueRow.baseFee,
        fine: dueRow.fine,
        month: dayjs(dueRow.month, 'YYYY-MM'),
        mode: "Cash",
        status: "Paid",
        paidDate: dayjs(),
        description: "",
        collectedByName: user?.name || ""
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        mode: "Cash",
        status: "Paid",
        paidDate: dayjs(),
        month: dayjs(),
        collectedByName: user?.name || ""
      });
    }
    setOpen(true);
  };

  const printReceipt = () => {
    printExactElement({
      element: receiptRef.current,
      title: `BIIT Receipt - ${selected?.receiptNo || "Preview"}`,
      pageStyles: RECEIPT_PAGE_STYLES,
      windowSize: "width=900,height=1100",
    });
  };

  // Separate data for Super Admin nested tabs
  const myBranchDues = duesData.filter(d => d.student?.branch === user?.branch);
  const otherBranchDues = duesData.filter(d => d.student?.branch !== user?.branch);

  const columns = [
    { title: "Receipt No.", dataIndex: "receiptNo", width: 165 },
    {
      title: "Student",
      width: 175,
      exportRender: (row) => `${row.student?.name} (${row.student?.regNo})`,
      render: (_, row) => (
        <div>
          <strong>{row.student?.name}</strong>
          <br />
          <span className="muted-text">{row.student?.regNo}</span>
        </div>
      ),
    },
    {
      title: "Base Fee",
      dataIndex: "amount",
      width: 120,
      exportRender: (row) => row.amount || 0,
      render: (value) => <strong>₹{Number(value || 0).toLocaleString("en-IN")}</strong>,
    },
    {
      title: "Late Fine",
      dataIndex: "fine",
      width: 120,
      exportRender: (row) => row.fine || 0,
      render: (value) => <span style={{ color: value > 0 ? '#cf1322' : 'inherit' }}>₹{Number(value || 0).toLocaleString("en-IN")}</span>,
    },
    {
      title: "Total",
      width: 120,
      exportRender: (row) => (row.amount || 0) + (row.fine || 0),
      render: (_, row) => <Tag color="green">₹{Number((row.amount || 0) + (row.fine || 0)).toLocaleString("en-IN")}</Tag>,
    },
    {
      title: "Mode",
      dataIndex: "mode",
      width: 130,
      render: (mode) => <Tag color="blue">{mode}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      render: (status = "Paid", row) => (
        <Select
          value={status}
          size="small"
          className="attendance-status-select"
          style={{ width: 125 }}
          onChange={(value) => updatePaymentStatus(row, value)}
          options={paymentStatuses}
        />
      ),
    },
    { title: "Month", dataIndex: "month", width: 110 },
    {
      title: "Date",
      dataIndex: "paidDate",
      width: 135,
      exportRender: (row) => dayjs(row.paidDate).format('DD MMM YYYY'),
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Action",
      width: 135,
      render: (_, row) => (
        <Space>
          <Button icon={<FiPrinter />} onClick={() => setSelected(row)}>
            Print
          </Button>
          <Popconfirm
            title="Delete payment?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deletePayment(row)}
          >
            <Button danger icon={<FiTrash2 />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const duesColumns = [
    {
      title: "Student",
      width: 200,
      exportRender: (row) => `${row.student?.name} (${row.student?.regNo})`,
      render: (_, row) => (
        <div>
          <strong>{row.student?.name}</strong>
          <br />
          <span className="muted-text">{row.student?.regNo}</span>
        </div>
      ),
    },
    { title: "Batch", dataIndex: ["student", "batch"], width: 180 },
    {
      title: "Base Fee",
      dataIndex: "baseFee",
      width: 110,
      render: (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`,
    },
    {
      title: "Late Days",
      dataIndex: "daysLate",
      width: 100,
      render: (value) => <span style={{ color: value > 0 ? '#cf1322' : 'inherit' }}>{value > 0 ? `${value} Days` : '-'}</span>
    },
    {
      title: "Calculated Fine",
      dataIndex: "fine",
      width: 130,
      render: (value) => <span style={{ color: value > 0 ? '#cf1322' : 'inherit' }}>₹{Number(value || 0).toLocaleString("en-IN")}</span>,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      width: 130,
      render: (value) => <strong>₹{Number(value || 0).toLocaleString("en-IN")}</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: "Action",
      width: 160,
      render: (_, row) => {
        const isMyBranch = row.student?.branch === user?.branch;
        const isPaid = row.status === 'Paid';
        return (
          <Button 
            type={isPaid ? "default" : (isMyBranch ? "primary" : "default")}
            disabled={isPaid || !isMyBranch} 
            onClick={() => openPaymentModal(row)}
          >
            {isPaid ? 'Paid' : (!isMyBranch ? (row.student?.branch || 'Other Branch') : 'Pay Now')}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<FiCreditCard />}
        title="Payments & Receipts"
        subtitle="Manage month-wise dues, calculate fines automatically, and print receipts"
        actionText="Manual Payment"
        actionIcon={<FiPlus />}
        onAction={() => openPaymentModal()}
      />

      {selected && (
        <Card className="content-card" bordered={false}>
          <div className="section-toolbar">
            <strong>Payment Receipt — {selected.receiptNo}</strong>
            <Button type="primary" icon={<FiPrinter />} onClick={printReceipt}>
              Print / Save PDF
            </Button>
          </div>
          <div ref={receiptRef} className="receipt-print premium-receipt">
            <div className="receipt-watermark">BIIT</div>
            <div className="receipt-head">
              <div className="receipt-logo">BIIT</div>
              <div>
                <h2>BIIT Coaching</h2>
                <p>Midnapore, West Bengal</p>
              </div>
            </div>
            <div className="receipt-line" />
            <div className="receipt-row receipt-row-four">
              <strong>Receipt No:</strong>
              <span>{selected.receiptNo}</span>
              <strong>Date:</strong>
              <span>{dayjs(selected.paidDate).format("DD MMM YYYY")}</span>
            </div>
            <div className="receipt-row">
              <span>Student Name</span>
              <strong>{selected.student?.name}</strong>
            </div>
            <div className="receipt-row">
              <span>Reg. Number</span>
              <strong>{selected.student?.regNo}</strong>
            </div>
            <div className="receipt-row">
              <span>Father's Name</span>
              <strong>{selected.student?.fatherName}</strong>
            </div>
            <div className="receipt-row">
              <span>Phone</span>
              <strong>{selected.student?.phone}</strong>
            </div>
            <div className="receipt-row">
              <span>For Month</span>
              <strong>{selected.month || "Course fee"}</strong>
            </div>
            <div className="receipt-row">
              <span>Payment Mode</span>
              <strong>{selected.mode}</strong>
            </div>
            <div className="receipt-row">
              <span>Payment Status</span>
              <strong>
                <Tag color={statusColor(selected.status || "Paid")}>
                  {selected.status || "Paid"}
                </Tag>
              </strong>
            </div>
            <div className="receipt-row">
              <span>Description</span>
              <strong>{selected.description || "Course fee"}</strong>
            </div>
            <div className="receipt-row">
              <span>Base Fee</span>
              <strong>INR {Number(selected.amount || 0).toLocaleString("en-IN")}</strong>
            </div>
            {selected.fine > 0 && (
              <div className="receipt-row">
                <span>Late Fine</span>
                <strong style={{ color: '#cf1322' }}>INR {Number(selected.fine || 0).toLocaleString("en-IN")}</strong>
              </div>
            )}
            <div className="amount-box">
              <span>Total Amount Paid</span>
              <strong>
                INR {Number((selected.amount || 0) + (selected.fine || 0)).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="receipt-footer">
              <p>Received by: {selected.collectedByName || selected.collectedBy?.name || "Admin"}</p>
              <p>This is a computer-generated receipt.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="content-card" bordered={false}>
        <Tabs
          items={[
            {
              key: 'dues',
              label: 'Monthly Dues Tracking',
              children: (
                <div>
                  <div className="section-toolbar compact-toolbar" style={{ justifyContent: 'space-between' }}>
                    <Space wrap>
                      <DatePicker
                        picker="month"
                        allowClear={false}
                        value={duesFilters.month}
                        onChange={(val) => applyDuesFilter({ month: val || dayjs() })}
                        format="MMM-YYYY"
                      />
                      <Select
                        allowClear
                        placeholder="Batch"
                        value={duesFilters.batch || undefined}
                        onChange={(value) => applyDuesFilter({ batch: value || "" })}
                        options={batchOptions.map(b => ({ value: b, label: b }))}
                        style={{ width: 180 }}
                      />
                      <Select
                        allowClear
                        placeholder="Status"
                        value={duesFilters.status || undefined}
                        onChange={(value) => applyDuesFilter({ status: value || "" })}
                        options={[{ value: 'Paid' }, { value: 'Due' }]}
                        style={{ width: 140 }}
                      />
                      <Input.Search
                        allowClear
                        enterButton={<FiSearch />}
                        placeholder="Search student, reg no..."
                        value={duesFilters.search}
                        onChange={(event) => applyDuesFilter({ search: event.target.value })}
                        onSearch={(value) => applyDuesFilter({ search: value })}
                        className="live-search-input"
                        style={{ width: 280 }}
                      />
                    </Space>
                    
                    <Space wrap>
                       <Button icon={<FiSettings />} onClick={() => setSettingOpen(true)}>
                          Fine Config: ₹{perDayFine}/day
                       </Button>
                       <Button 
                          icon={<FiDownload />} 
                          onClick={() => exportToCSV(duesData, duesColumns, `Monthly_Dues_${duesFilters.month.format('YYYY_MM')}.csv`)}
                        >
                          Export Excel
                       </Button>
                    </Space>
                  </div>
                  {duesLoading ? (
                    <ShimmerTable columns={7} rows={7} />
                  ) : isAdmin ? (
                    <Tabs
                      type="card"
                      style={{ marginTop: 16 }}
                      items={[
                        {
                          key: 'my-branch',
                          label: `${user?.branch || 'Main Branch'} Students (${myBranchDues.length})`,
                          children: (
                            <Table
                              rowKey="key"
                              columns={duesColumns}
                              dataSource={myBranchDues}
                              scroll={{ x: "max-content" }}
                              tableLayout="auto"
                            />
                          )
                        },
                        {
                          key: 'other-branches',
                          label: `Other Franchise Students (${otherBranchDues.length})`,
                          children: (
                            <Table
                              rowKey="key"
                              columns={duesColumns}
                              dataSource={otherBranchDues}
                              scroll={{ x: "max-content" }}
                              tableLayout="auto"
                            />
                          )
                        }
                      ]}
                    />
                  ) : (
                    <Table
                      rowKey="key"
                      columns={duesColumns}
                      dataSource={duesData}
                      scroll={{ x: "max-content" }}
                      tableLayout="auto"
                    />
                  )}
                </div>
              )
            },
            {
              key: 'history',
              label: 'Payment History',
              children: (
                <div>
                  <div className="section-toolbar compact-toolbar" style={{ justifyContent: 'space-between' }}>
                    <Space wrap>
                      <Input.Search
                        allowClear
                        enterButton={<FiSearch />}
                        placeholder="Search receipt, student, month..."
                        value={filters.search}
                        onChange={(event) => applyFilter({ search: event.target.value })}
                        onSearch={(value) => applyFilter({ search: value })}
                        className="live-search-input"
                        style={{ width: 340 }}
                      />
                      <Select
                        allowClear
                        placeholder="Mode"
                        value={filters.mode || undefined}
                        onChange={(value) => applyFilter({ mode: value || "" })}
                        options={paymentModes}
                        style={{ width: 140 }}
                      />
                      <Select
                        allowClear
                        placeholder="Status"
                        value={filters.status || undefined}
                        onChange={(value) => applyFilter({ status: value || "" })}
                        options={paymentStatuses}
                        style={{ width: 140 }}
                      />
                      <Button onClick={() => applyFilter({ search: "", mode: "", status: "" })}>
                        Reset
                      </Button>
                    </Space>
                    <Button 
                      icon={<FiDownload />} 
                      onClick={() => exportToCSV(payments, columns, `Payment_History.csv`)}
                    >
                      Export Excel
                    </Button>
                  </div>
                  {loading ? (
                    <ShimmerTable columns={8} rows={7} />
                  ) : (
                    <Table
                      rowKey="_id"
                      columns={columns}
                      dataSource={payments}
                      scroll={{ x: "max-content" }}
                      tableLayout="auto"
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title="Payment Collection"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={savePayment}
        okText="Generate Receipt"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ mode: "Cash", status: "Paid", paidDate: dayjs(), month: dayjs(), amount: 0, fine: 0 }}
        >
          <Form.Item name="student" label="Student" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={students
                .filter((s) => s.branch === user?.branch)
                .map((student) => ({
                value: student._id,
                label: `${student.name} - ${student.regNo}`,
              }))}
            />
          </Form.Item>
          
          <Space className="full-width" size="large">
            <Form.Item name="amount" label="Base Fee Amount" rules={[{ required: true }]}>
              <InputNumber min={0} className="full-width" />
            </Form.Item>
            <Form.Item name="fine" label="Late Fine Amount" tooltip="Editable fine added to total payment">
              <InputNumber min={0} className="full-width" />
            </Form.Item>
          </Space>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: '-14px', marginBottom: '14px' }}>
             Total collected will be Base Fee + Fine.
          </Typography.Text>

          <Form.Item name="month" label="For Month" rules={[{ required: true }]}>
            <DatePicker picker="month" format="YYYY-MM" className="full-width" />
          </Form.Item>
          <Form.Item name="mode" label="Payment Mode">
            <Select options={paymentModes} />
          </Form.Item>
          <Form.Item name="status" label="Payment Status">
            <Select options={paymentStatuses} />
          </Form.Item>
          <Form.Item name="paidDate" label="Payment Date">
            <DatePicker className="full-width" />
          </Form.Item>
          
          <Form.Item 
             name="collectedByName" 
             label="Payment Received By (Name)" 
             rules={[{ required: true, message: 'Please enter the name of the receiver' }]}
          >
            <Input placeholder="Enter receiver's name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional notes" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Fine Configuration"
        open={settingOpen}
        onCancel={() => setSettingOpen(false)}
        onOk={saveSetting}
        okText="Save Config"
      >
        <Form form={settingForm} layout="vertical">
          <Form.Item name="perDayFine" label="Per Day Late Fine Amount (₹)" extra="This fine is calculated automatically if a student pays after the 5th of the month.">
            <InputNumber min={0} className="full-width" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}