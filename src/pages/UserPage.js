import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, DatePicker, TimePicker, message, Row, Col, Typography } from 'antd';
import { 
    DashboardOutlined,
    MedicineBoxOutlined,
    CalendarOutlined,
    LogoutOutlined,
    UserOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo.png';

const { Sider, Content, Header } = Layout;

const UserPage = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState('1');
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const user = JSON.parse(localStorage.getItem('user'));
    const [patientProfile, setPatientProfile] = useState(null);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
        fetchPatientProfile();
        fetchRecords();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8080/api/v1/user/doctors', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDoctors(res.data.doctors);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            message.error('Error fetching doctors list');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8080/api/v1/user/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAppointments(res.data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            message.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setPatientProfile(response.data);
                form.setFieldsValue(response.data); // Set form values with fetched data
            } else {
                setPatientProfile(null); // No profile data found
            }
        } catch (error) {
            console.error('Error fetching patient profile:', error);
            message.error('Error fetching patient profile');
            setPatientProfile(null); // Reset profile if there's an error
        }
    };

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/user/records', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(response.data.records);
        } catch (error) {
            console.error('Error fetching records:', error);
            message.error('Error fetching records');
        }
    };

    const handleMenuClick = (key) => {
        setCurrentPage(key);
    };

    const handleLogout = () => {
        localStorage.clear();
        message.success('Logged out successfully');
        navigate('/login');
    };

    const handleBookAppointment = async (values) => {
        try {
            setLoading(true);
            const appointmentData = {
                doctorId: selectedDoctor._id,
                appointmentDate: values.date.format('YYYY-MM-DD'),
                appointmentTime: values.time.format('HH:mm'),
                reason: values.reason
            };

            const res = await axios.post(
                'http://localhost:8080/api/v1/user/book-appointment',
                appointmentData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (res.data.success) {
                message.success('Appointment booked successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchAppointments();
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            message.error(error.response?.data?.message || 'Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (values) => {
        try {
            const token = localStorage.getItem('token');
            if (patientProfile) {
                // Update existing profile
                await axios.put('http://localhost:8080/api/v1/user/profile', values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Profile updated successfully');
            } else {
                // Create new profile
                await axios.post('http://localhost:8080/api/v1/user/profile', values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Profile created successfully');
            }
            fetchPatientProfile(); // Refresh profile data
        } catch (error) {
            message.error('Error updating or creating profile');
        }
    };
    
    const handleProfileUpdate = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/api/v1/user/profile', values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Profile updated successfully');
            setPatientProfile(response.data);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Error updating profile');
        }
    };

    const handleProfileCreate = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/v1/user/profile', values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Profile created successfully');
            setPatientProfile(response.data);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error creating profile:', error);
            message.error('Error creating profile');
        }
    };

    const handleProfileClick = () => {
        setIsModalVisible(true);
        fetchPatientProfile(); // Fetch profile data when modal is opened
    };

    const renderProfileForm = () => {
        return (
            <Form layout="vertical" onFinish={handleProfileSubmit} initialValues={patientProfile || {}}>
                <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Age" name="age" rules={[{ required: true, message: 'Please enter your age' }]}>
                    <Input type="number" />
                </Form.Item>
                <Form.Item label="Chronic Diseases" name="chronicDiseases">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item label="Contact Number" name="contactNumber" rules={[{ required: true, message: 'Please enter your contact number' }]}>
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                    {patientProfile ? 'Save Profile' : 'Create Profile'}
                </Button>
            </Form>
        );
    };

    const renderContent = () => {
        if (currentPage === 'profile') {
            return (
                <div>
                    <h2>{patientProfile ? 'Edit Profile' : 'Add Profile'}</h2>
                    {renderProfileForm()}
                </div>
            );
        } else if (currentPage === 'records') {
            return (
                <Card title="Your Records">
                    {records.length > 0 ? (
                        records.map(record => (
                            <Typography.Paragraph key={record._id}>
                                <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">{record.fileName}</a>
                            </Typography.Paragraph>
                        ))
                    ) : (
                        <Typography.Paragraph>No records found.</Typography.Paragraph>
                    )}
                </Card>
            );
        }
        switch(currentPage) {
            case '1': // Dashboard
                return (
                    <div className="site-card-wrapper">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Card title="Total Appointments" bordered={false}>
                                    <h2>{appointments.length}</h2>
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card title="Pending Appointments" bordered={false}>
                                    <h2>{appointments.filter(app => app.status === 'pending').length}</h2>
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card title="Completed Appointments" bordered={false}>
                                    <h2>{appointments.filter(app => app.status === 'completed').length}</h2>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                );
            case '2': // Doctors
                return (
                    <Row gutter={[16, 16]}>
                        {doctors.map(doctor => (
                            <Col xs={24} sm={12} md={8} lg={6} key={doctor._id}>
                                <Card
                                    className="doctor-card"
                                    title={`Dr. ${doctor.name}`}
                                    extra={
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                setSelectedDoctor(doctor);
                                                setIsModalVisible(true);
                                            }}
                                        >
                                            Book
                                        </Button>
                                    }
                                >
                                    <p><strong>Specialization:</strong> {doctor.specialization}</p>
                                    <p><strong>Email:</strong> {doctor.email}</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                );
            case '3': // Appointments
                return (
                    <Table
                        loading={loading}
                        dataSource={appointments}
                        columns={[
                            {
                                title: 'Doctor',
                                dataIndex: ['doctor', 'name'],
                                key: 'doctorName',
                                render: name => `Dr. ${name}`
                            },
                            {
                                title: 'Date',
                                dataIndex: 'appointmentDate',
                                key: 'date',
                                render: date => moment(date).format('YYYY-MM-DD')
                            },
                            {
                                title: 'Time',
                                dataIndex: 'appointmentTime',
                                key: 'time'
                            },
                            {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                render: status => (
                                    <span style={{
                                        color: status === 'confirmed' ? 'green' : 
                                               status === 'pending' ? 'orange' : 'red'
                                    }}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                )
                            }
                        ]}
                        rowKey="_id"
                        scroll={{ x: true }}
                    />
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
                <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center' }}>
                    <img src={Logo} alt="Logo" style={{ width: '100%', height: 'auto' }} />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    selectedKeys={[currentPage]}
                    onClick={({ key }) => handleMenuClick(key)}
                    items={[
                        {
                            key: '1',
                            icon: <DashboardOutlined />,
                            label: 'Dashboard',
                        },
                        {
                            key: '2',
                            icon: <MedicineBoxOutlined />,
                            label: 'Doctors',
                        },
                        {
                            key: '3',
                            icon: <CalendarOutlined />,
                            label: 'Appointments',
                        },
                        {
                            key: '4',
                            icon: <UserOutlined />,
                            label: 'Profile',
                            onClick: () => setCurrentPage('profile'),
                        },
                        {
                            key: '5',
                            icon: <FileTextOutlined />,
                            label: 'Records',
                            onClick: () => setCurrentPage('records'),
                        },
                        {
                            key: '6',
                            icon: <LogoutOutlined />,
                            label: 'Logout',
                            onClick: handleLogout,
                        },
                    ]}
                />
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
                        Welcome, {user?.name || 'User'}
                    </span>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
                    {renderContent()}
                </Content>
            </Layout>

            <Modal
                title={`Book Appointment with Dr. ${selectedDoctor?.name}`}
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleBookAppointment} layout="vertical">
                    <Form.Item
                        name="date"
                        label="Appointment Date"
                        rules={[{ required: true, message: 'Please select date!' }]}
                    >
                        <DatePicker 
                            style={{ width: '100%' }}
                            disabledDate={current => current && current < moment().startOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="time"
                        label="Appointment Time"
                        rules={[{ required: true, message: 'Please select time!' }]}
                    >
                        <TimePicker 
                            format="HH:mm"
                            style={{ width: '100%' }}
                            minuteStep={30}
                            showNow={false}
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason for Visit"
                        rules={[{ required: true, message: 'Please enter reason!' }]}
                    >
                    <Input.TextArea />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Book Appointment
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default UserPage;
