import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, message, Tabs, Row, Col, Statistic, Space } from 'antd';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  DashboardOutlined, 
  CalendarOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo.png';

const { Sider, Content, Header } = Layout;

const AdminPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('1'); // This is used to track the current page
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'doctor' or 'user'
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalDoctors: 0,
    totalUsers: 0,
    totalAppointments: 0
  });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordForm] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data...'); // Debug log
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug log

      const [doctorsRes, usersRes, appointmentsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/admin/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/v1/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/v1/admin/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Doctors response:', doctorsRes.data); // Debug log
      console.log('Users response:', usersRes.data); // Debug log
      console.log('Appointments response:', appointmentsRes.data); // Debug log

      setDoctors(doctorsRes.data.doctors);
      setUsers(usersRes.data.users);
      setAppointments(appointmentsRes.data.appointments);
      
      setStatistics({
        totalDoctors: doctorsRes.data.doctors.length,
        totalUsers: usersRes.data.users.length,
        totalAppointments: appointmentsRes.data.appointments.length
      });
    } catch (error) {
      console.error('Error fetching data:', error.response || error); // Enhanced error logging
      message.error('Error fetching data');
    }
  };

  const handleAddDoctor = async (values) => {
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/admin/add-doctor',
        { ...values, role: 'doctor' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      if (res.data.success) {
        message.success('Doctor added successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      message.error('Error adding doctor');
    }
  };

  const handleAddUser = async (values) => {
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/admin/add-user',
        { ...values, role: 'user' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      if (res.data.success) {
        message.success('User added successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      message.error('Error adding user');
    }
  };

  const handleDelete = async (id, type) => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/v1/admin/${type}/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      if (res.data.success) {
        message.success(`${type} deleted successfully`);
        fetchData();
      }
    } catch (error) {
      message.error(`Error deleting ${type}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const handlePasswordChange = async (values) => {
    try {
      const res = await axios.put(
        'http://localhost:8080/api/v1/admin/change-password',
        {
          userId: selectedUser._id,
          newPassword: values.newPassword
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (res.data.success) {
        message.success('Password changed successfully');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Error changing password');
    }
  };

  const doctorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => {
              setSelectedUser(record);
              setPasswordModalVisible(true);
            }}
          >
            Change Password
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={() => handleDelete(record._id, 'doctor')}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => {
              setSelectedUser(record);
              setPasswordModalVisible(true);
            }}
          >
            Change Password
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={() => handleDelete(record._id, 'user')}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const appointmentColumns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patientName',
    },
    {
      title: 'Doctor',
      dataIndex: ['doctor', 'name'],
      key: 'doctorName',
    },
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  // Define the handleMenuClick function
  const handleMenuClick = (key) => {
    setCurrentPage(key); // Update the current page based on the selected menu item
  };

  const renderContent = () => {
    switch(currentPage) {
      case '1': // Dashboard
        return (
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Doctors"
                  value={statistics.totalDoctors}
                  prefix={<MedicineBoxOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={statistics.totalUsers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Appointments"
                  value={statistics.totalAppointments}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>
        );
      case '2': // Doctors
        return (
          <>
            <Button 
              type="primary" 
              onClick={() => {
                setModalType('doctor');
                setIsModalVisible(true);
              }}
              style={{ marginBottom: 16 }}
            >
              Add New Doctor
            </Button>
            <Table columns={doctorColumns} dataSource={doctors} rowKey="_id" />
          </>
        );
      case '3': // Users
        return (
          <>
            <Button 
              type="primary" 
              onClick={() => {
                setModalType('user');
                setIsModalVisible(true);
              }}
              style={{ marginBottom: 16 }}
            >
              Add New User
            </Button>
            <Table columns={userColumns} dataSource={users} rowKey="_id" />
          </>
        );
      case '4': // Appointments
        return (
          <Table columns={appointmentColumns} dataSource={appointments} rowKey="_id" />
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo at the top of the sidebar */}
        <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" style={{ width: '100%', height: 'auto' }} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[currentPage]}
          onClick={({ key }) => handleMenuClick(key)} // Use the handleMenuClick function
        >
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<MedicineBoxOutlined />}>
            Doctors
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            Users
          </Menu.Item>
          <Menu.Item key="4" icon={<CalendarOutlined />}>
            Appointments
          </Menu.Item>
          <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1
        }}>
          <span style={{ 
            fontSize: '16px',
            color: '#1890ff'
          }}>
            Welcome, {user?.name || 'Admin'}
          </span>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Modals for adding doctors/users and changing passwords */}
      <Modal
        title={modalType === 'doctor' ? 'Add New Doctor' : 'Add New User'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={modalType === 'doctor' ? handleAddDoctor : handleAddUser}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input.Password />
          </Form.Item>

          {modalType === 'doctor' && (
            <Form.Item
              name="specialization"
              label="Specialization"
              rules={[{ required: true, message: 'Please input specialization!' }]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add {modalType === 'doctor' ? 'Doctor' : 'User'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Change Password for ${selectedUser?.name}`}
        visible={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          onFinish={handlePasswordChange}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;
