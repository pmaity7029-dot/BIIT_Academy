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
  message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  FiCreditCard,
  FiPlus,
  FiPrinter,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import dayjs from "dayjs";
import api from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { printExactElement } from "../utils/printElement.js";
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

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ search: "", mode: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const receiptRef = useRef(null);

  const load = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const [paymentRes, studentRes] = await Promise.all([
        api.get("/payments", { params: nextFilters }),
        api.get("/students"),
      ]);
      setPayments(paymentRes.data);
      setStudents(studentRes.data);
      if (!selected && paymentRes.data[0]) setSelected(paymentRes.data[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => message.error("Payments loading failed"));
  }, []);

  const save = async () => {
    try {
      const values = await form.validateFields();
      const { data } = await api.post("/payments", {
        ...values,
        paidDate: values.paidDate?.toISOString(),
      });
      message.success("Payment receipt generated");
      setOpen(false);
      form.resetFields();
      setSelected(data);
      load();
    } catch (error) {
      if (!error.errorFields) message.error("Payment save failed");
    }
  };

  const applyFilter = (patch) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    load(nextFilters).catch(() => message.error("Payments loading failed"));
  };

  const updatePaymentStatus = async (payment, status) => {
    try {
      const { data } = await api.put(`/payments/${payment._id}`, { status });
      message.success("Payment status updated");
      setPayments((prev) =>
        prev.map((item) => (item._id === payment._id ? data : item)),
      );
      if (selected?._id === payment._id) setSelected(data);
    } catch (error) {
      message.error(error?.response?.data?.message || "Status update failed");
    }
  };

  const deletePayment = async (payment) => {
    try {
      await api.delete(`/payments/${payment._id}`);
      message.success("Payment deleted");
      if (selected?._id === payment._id) setSelected(null);
      load();
    } catch (error) {
      message.error(error?.response?.data?.message || "Payment delete failed");
    }
  };

  const printReceipt = () => {
    printExactElement({
      element: receiptRef.current,
      title: `BIIT Receipt - ${selected?.receiptNo || "Preview"}`,
      pageStyles: RECEIPT_PAGE_STYLES,
      windowSize: "width=900,height=1100",
    });
  };

  const columns = [
    { title: "Receipt No.", dataIndex: "receiptNo", width: 165 },
    {
      title: "Student",
      width: 175,
      render: (_, row) => (
        <div>
          <strong>{row.student?.name}</strong>
          <br />
          <span className="muted-text">{row.student?.regNo}</span>
        </div>
      ),
    },
    { title: "Centre", dataIndex: ["student", "centre"], width: 170 },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 140,
      render: (value) => (
        <strong>INR {Number(value || 0).toLocaleString("en-IN")}</strong>
      ),
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
          style={{ width: 125 }}
          onChange={(value) => updatePaymentStatus(row, value)}
          options={paymentStatuses}
        />
      ),
    },
    { title: "Month", dataIndex: "month", width: 135 },
    {
      title: "Date",
      dataIndex: "paidDate",
      width: 135,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Action",
      width: 165,
      render: (_, row) => (
        <Space>
          <Button icon={<FiPrinter />} onClick={() => setSelected(row)}>
            Receipt
          </Button>
          <Popconfirm
            title="Delete this payment?"
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

  return (
    <div>
      <PageHeader
        icon={<FiCreditCard />}
        title="Payments & Receipts"
        subtitle="Record fees, generate and print payment receipts"
        actionText="Add Payment"
        actionIcon={<FiPlus />}
        onAction={() => setOpen(true)}
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
                <p>BIIT - Main Branch</p>
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
            <div className="amount-box">
              <span>Amount Paid</span>
              <strong>
                INR {Number(selected.amount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="receipt-footer">
              <p>Collected by: {selected.collectedBy?.name || "Super Admin"}</p>
              <p>This is a computer-generated receipt.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="content-card" bordered={false} title="Payment History">
        <div className="section-toolbar compact-toolbar">
          <Space wrap>
            <Input.Search
              allowClear
              enterButton={<FiSearch />}
              placeholder="Search receipt, student, reg no, month..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              onSearch={(value) => applyFilter({ search: value })}
              style={{ width: 340 }}
            />
            <Select
              allowClear
              placeholder="Mode"
              value={filters.mode || undefined}
              onChange={(value) => applyFilter({ mode: value || "" })}
              options={paymentModes}
              style={{ width: 160 }}
            />
            <Select
              allowClear
              placeholder="Status"
              value={filters.status || undefined}
              onChange={(value) => applyFilter({ status: value || "" })}
              options={paymentStatuses}
              style={{ width: 160 }}
            />
            <Button
              onClick={() => applyFilter({ search: "", mode: "", status: "" })}
            >
              Reset
            </Button>
          </Space>
        </div>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={payments}
          loading={loading}
          scroll={{ x: "max-content" }}
          tableLayout="auto"
        />
      </Card>

      <Modal
        title="Add Payment"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="Generate Receipt"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ mode: "UPI", status: "Paid", paidDate: dayjs() }}
        >
          <Form.Item
            name="student"
            label="Student"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={students.map((student) => ({
                value: student._id,
                label: `${student.name} - ${student.regNo}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={1} className="full-width" />
          </Form.Item>
          <Form.Item name="mode" label="Payment Mode">
            <Select options={paymentModes} />
          </Form.Item>
          <Form.Item name="status" label="Payment Status">
            <Select options={paymentStatuses} />
          </Form.Item>
          <Form.Item name="month" label="For Month">
            <Input placeholder="MAY-2026" />
          </Form.Item>
          <Form.Item name="paidDate" label="Payment Date">
            <DatePicker className="full-width" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Course fee" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
