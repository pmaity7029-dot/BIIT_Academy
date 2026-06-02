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
  Tabs,
  Tag,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { FiBookOpen, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";
import api from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { ShimmerTable } from "../components/ShimmerLoading.jsx";
import React from "react";

const courseStatusOptions = ["Active", "Inactive", "Completed"].map(
  (value) => ({ value }),
);
const batchStatusOptions = [
  "Active",
  "Inactive",
  "Completed",
  "Running",
  "Upcoming",
].map((value) => ({ value }));

const statusColor = (status) => {
  if (status === "Active" || status === "Running") return "green";
  if (status === "Completed") return "blue";
  if (status === "Upcoming") return "gold";
  return "default";
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseFilters, setCourseFilters] = useState({
    search: "",
    status: "",
  });
  const [batchFilters, setBatchFilters] = useState({ search: "", status: "" });
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [courseForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [courseOpen, setCourseOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);

  const loadCourses = async (nextFilters = courseFilters) => {
    setLoadingCourses(true);
    try {
      const { data } = await api.get("/courses", { params: nextFilters });
      setCourses(data);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadBatches = async (nextFilters = batchFilters) => {
    setLoadingBatches(true);
    try {
      const { data } = await api.get("/courses/batches/list", {
        params: nextFilters,
      });
      setBatches(data);
    } finally {
      setLoadingBatches(false);
    }
  };

  const load = async () => {
    await Promise.all([loadCourses(), loadBatches()]);
  };

  useEffect(() => {
    load().catch(() => message.error("Unable to load courses and batches"));
  }, []);

  const saveCourse = async () => {
    try {
      const values = await courseForm.validateFields();
      await api.post("/courses", values);
      message.success("Course added");
      setCourseOpen(false);
      courseForm.resetFields();
      loadCourses();
    } catch (error) {
      if (!error.errorFields) message.error("Course save failed");
    }
  };

  const saveBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      const selectedCourse = courses.find(
        (course) => course._id === values.course,
      );
      await api.post("/courses/batches", {
        ...values,
        courseName: selectedCourse?.title,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      });
      message.success("Batch added");
      setBatchOpen(false);
      batchForm.resetFields();
      loadBatches();
    } catch (error) {
      if (!error.errorFields) message.error("Batch save failed");
    }
  };

  const applyCourseFilters = (patch) => {
    const nextFilters = { ...courseFilters, ...patch };
    setCourseFilters(nextFilters);
    loadCourses(nextFilters).catch(() =>
      message.error("Unable to load courses"),
    );
  };

  const applyBatchFilters = (patch) => {
    const nextFilters = { ...batchFilters, ...patch };
    setBatchFilters(nextFilters);
    loadBatches(nextFilters).catch(() =>
      message.error("Unable to load batches"),
    );
  };

  const updateCourseStatus = async (course, status) => {
    try {
      const { data } = await api.put(`/courses/${course._id}`, { status });
      message.success("Course status updated");
      setCourses((prev) =>
        prev.map((item) => (item._id === course._id ? data : item)),
      );
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Course status update failed",
      );
    }
  };

  const updateBatchStatus = async (batch, status) => {
    try {
      const { data } = await api.put(`/courses/batches/${batch._id}`, {
        status,
      });
      message.success("Batch status updated");
      setBatches((prev) =>
        prev.map((item) => (item._id === batch._id ? data : item)),
      );
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Batch status update failed",
      );
    }
  };

  const deleteCourse = async (course) => {
    try {
      await api.delete(`/courses/${course._id}`);
      message.success("Course deleted");
      loadCourses();
    } catch (error) {
      message.error(error?.response?.data?.message || "Course delete failed");
    }
  };

  const deleteBatch = async (batch) => {
    try {
      await api.delete(`/courses/batches/${batch._id}`);
      message.success("Batch deleted");
      loadBatches();
    } catch (error) {
      message.error(error?.response?.data?.message || "Batch delete failed");
    }
  };

const courseColumns = [
  {
    title: "Course",
    dataIndex: "title",
    width: 260,
    render: (text) => (
      <div className="admin-table-wrap-text" title={text}>
        {text || "Not set"}
      </div>
    ),
  },
  {
    title: "Category",
    dataIndex: "category",
    width: 170,
    render: (text) => (
      <div className="admin-table-wrap-text" title={text}>
        {text || "Not set"}
      </div>
    ),
  },
  {
    title: "Duration",
    dataIndex: "duration",
    width: 160,
    render: (text) => (
      <div className="admin-table-wrap-text" title={text}>
        {text || "Not set"}
      </div>
    ),
  },
  {
    title: "Fee",
    dataIndex: "fee",
    width: 130,
    render: (value) => (
      <span className="admin-table-nowrap">
        INR {Number(value || 0).toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    width: 155,
    render: (status, row) => (
      <Select
        value={status}
        size="small"
        style={{ width: 125 }}
        onChange={(value) => updateCourseStatus(row, value)}
        options={courseStatusOptions}
      />
    ),
  },
  {
    title: "Delete",
    width: 80,
    align: "center",
    render: (_, row) => (
      <Popconfirm
        title="Delete this course?"
        okText="Delete"
        okButtonProps={{ danger: true }}
        onConfirm={() => deleteCourse(row)}
      >
        <Button danger icon={<FiTrash2 />} />
      </Popconfirm>
    ),
  },
];

  const batchColumns = [
    {
      title: "Batch",
      dataIndex: "name",
      width: 150,
      render: (text) => (
        <div className="batch-table-text" title={text}>
          {text || "Not set"}
        </div>
      ),
    },

    
    {
      title: "Course",
      width: 150,
      render: (_, row) => {
        const courseName = row.course?.title || row.courseName || "Not linked";

        return (
          <div className="batch-table-text" title={courseName}>
            {courseName}
          </div>
        );
      },
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      width: 190,
      render: (text) => (
        <div className="batch-table-text schedule-text" title={text}>
          {text || "Not set"}
        </div>
      ),
    },
    {
      title: "Start",
      dataIndex: "startDate",
      width: 125,
      render: (date) => (
        <span className="batch-nowrap">
          {date ? dayjs(date).format("DD MMM YYYY") : "Not set"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 105,
      render: (status, row) => (
        <Select
          value={status}
          size="small"
          style={{ width: 145 }}
          onChange={(value) => updateBatchStatus(row, value)}
          options={batchStatusOptions}
        />
      ),
    },
    {
      title: "Delete",
      width: 90,
      align: "center",
      render: (_, row) => (
        <Popconfirm
          title="Delete this batch?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteBatch(row)}
        >
          <Button danger icon={<FiTrash2 />} />
        </Popconfirm>
      ),
    },
  ];

  const batchToolbar = (
    <div className="section-toolbar">
      <strong>All Batches ({batches.length})</strong>
      <Space wrap>
        <Input.Search
          allowClear
          enterButton={<FiSearch />}
          placeholder="Search batch, course..."
          value={batchFilters.search}
          onChange={(event) =>
            setBatchFilters((prev) => ({ ...prev, search: event.target.value }))
          }
          onSearch={(value) => applyBatchFilters({ search: value })}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Status"
          value={batchFilters.status || undefined}
          onChange={(value) => applyBatchFilters({ status: value || "" })}
          options={batchStatusOptions.map((item) => ({
            ...item,
            label: <Tag color={statusColor(item.value)}>{item.value}</Tag>,
          }))}
          style={{ width: 170 }}
        />
        <Button onClick={() => applyBatchFilters({ search: "", status: "" })}>
          Reset
        </Button>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setBatchOpen(true)}
        >
          Add Batch
        </Button>
      </Space>
    </div>
  );

  const courseToolbar = (
    <div className="section-toolbar">
      <strong>All Courses ({courses.length})</strong>
      <Space wrap>
        <Input.Search
          allowClear
          enterButton={<FiSearch />}
          placeholder="Search course, category..."
          value={courseFilters.search}
          onChange={(event) =>
            setCourseFilters((prev) => ({
              ...prev,
              search: event.target.value,
            }))
          }
          onSearch={(value) => applyCourseFilters({ search: value })}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Status"
          value={courseFilters.status || undefined}
          onChange={(value) => applyCourseFilters({ status: value || "" })}
          options={courseStatusOptions.map((item) => ({
            ...item,
            label: <Tag color={statusColor(item.value)}>{item.value}</Tag>,
          }))}
          style={{ width: 170 }}
        />
        <Button onClick={() => applyCourseFilters({ search: "", status: "" })}>
          Reset
        </Button>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setCourseOpen(true)}
        >
          Add Course
        </Button>
      </Space>
    </div>
  );

  return (
    <div>
      <PageHeader
        icon={<FiBookOpen />}
        title="Batches & Courses"
        subtitle="Search, filter, change status, and manage course catalog"
      />
      <Card className="content-card" bordered={false}>
        <Tabs
          items={[
            {
              key: "batches",
              label: "Batches",
              children: (
                <>
                  {batchToolbar}
                  {loadingBatches ? (
                    <ShimmerTable columns={6} rows={7} />
                  ) : (
                    <Table
                      rowKey="_id"
                      columns={batchColumns}
                      dataSource={batches}
                      scroll={{ x: 1240 }}
                      tableLayout="fixed"
                      size="middle"
                      className="course-batch-table"
                    />
                  )}
                </>
              ),
            },
            {
              key: "courses",
              label: "Courses",
              children: (
                <>
                  {courseToolbar}
                  {loadingCourses ? (
                    <ShimmerTable columns={6} rows={7} />
                  ) : (
                    <Table
                      rowKey="_id"
                      columns={courseColumns}
                      dataSource={courses}
                      scroll={{ x: 1080 }}
                      tableLayout="fixed"
                      size="middle"
                      className="course-list-table compact-course-table"
                    />
                  )}
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Add Course"
        open={courseOpen}
        onCancel={() => setCourseOpen(false)}
        onOk={saveCourse}
        okText="Save Course"
      >
        <Form
          form={courseForm}
          layout="vertical"
          initialValues={{ status: "Active" }}
        >
          <Form.Item
            name="title"
            label="Course Title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true }]}
          >
            <Input placeholder="6 Months" />
          </Form.Item>
          <Form.Item name="fee" label="Fee" rules={[{ required: true }]}>
            <InputNumber className="full-width" min={0} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={courseStatusOptions} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Batch"
        open={batchOpen}
        onCancel={() => setBatchOpen(false)}
        onOk={saveBatch}
        okText="Save Batch"
      >
        <Form
          form={batchForm}
          layout="vertical"
          initialValues={{ status: "Active" }}
        >
          <Form.Item
            name="name"
            label="Batch Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="course" label="Course">
            <Select
              showSearch
              optionFilterProp="label"
              options={courses.map((course) => ({
                value: course._id,
                label: course.title,
              }))}
            />
          </Form.Item>
          <Form.Item name="schedule" label="Schedule">
            <Input placeholder="Mon to Fri, 10 AM - 12 PM" />
          </Form.Item>
          <Space className="full-width" size="large">
            <Form.Item name="startDate" label="Start Date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="endDate" label="End Date">
              <DatePicker />
            </Form.Item>
          </Space>
          <Form.Item name="status" label="Status">
            <Select options={batchStatusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
