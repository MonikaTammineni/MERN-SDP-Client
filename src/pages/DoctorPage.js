import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Calendar, Badge, Modal, Button, Form, TimePicker, message, Tabs, Row, Col, Statistic, Input, Upload } from 'antd';
import { 
    CalendarOutlined, 
    ClockCircleOutlined, 
    UserOutlined, 
    LogoutOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo.png'; 

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

const DoctorPage = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState('1'); 
    const [appointments, setAppointments] = useState([]);
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        todayAppointments: 0
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchAppointments();
        fetchBlockedSlots();
    }, []);

    const fetchAppointments = async () => {
        try {
            console.log('Fetching appointments...');
            const token = localStorage.getItem('token');
            console.log('Using token:', token);

            const res = await axios.get(`http://localhost:8080/api/v1/doctor/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Appointments response:', res.data);
            setAppointments(res.data.appointments);

            // Update statistics
            const today = moment().startOf('day');
            setStatistics({
                totalAppointments: res.data.appointments.length,
                pendingAppointments: res.data.appointments.filter(app => app.status === 'pending').length,
                todayAppointments: res.data.appointments.filter(app => 
                    moment(app.appointmentDate).isSame(today, 'day')
                ).length
            });
        } catch (error) {
            console.error('Error fetching appointments:', error.response || error);
            message.error('Error fetching appointments: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchBlockedSlots = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/doctor/blocked-slots`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBlockedSlots(res.data.blockedSlots);
        } catch (error) {
            message.error('Error fetching blocked slots');
        }
    };

    const handleAppointmentStatus = async (appointmentId, status) => {
        try {
            await axios.put(
                `http://localhost:8080/api/v1/doctor/appointment-status`,
                { appointmentId, status },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            message.success(`Appointment ${status}`);
            fetchAppointments();
        } catch (error) {
            message.error('Error updating appointment status');
        }
    };

    const handleBlockSlot = async (values) => {
        try {
            await axios.post(
                `http://localhost:8080/api/v1/doctor/block-slot`,
                {
                    date: selectedDate.format('YYYY-MM-DD'),
                    time: values.time.format('HH:mm'),
                    reason: values.reason
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            message.success('Time slot blocked successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchBlockedSlots();
        } catch (error) {
            message.error('Error blocking time slot');
        }
    };

    const handleCompleteAppointment = async (appointmentId, prescriptionFile) => {
        const formData = new FormData();
        formData.append('prescription', prescriptionFile); // Append the prescription file

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/doctor/appointment-status`, {
                appointmentId,
                status: 'completed',
                prescription: formData // Send the prescription file
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Appointment marked as completed');
            fetchAppointments(); // Refresh the appointments list
        } catch (error) {
            message.error('Error completing appointment');
        }
    };

    const appointmentColumns = [
        {
            title: 'Patient Name',
            dataIndex: ['patient', 'name'],
            key: 'patientName',
        },
        {
            title: 'Date',
            dataIndex: 'appointmentDate',
            key: 'date',
            render: (date) => moment(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Time',
            dataIndex: 'appointmentTime',
            key: 'time',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <span style={{
                    color: status === 'completed' ? 'green' : (status === 'confirmed' ? 'orange' : 'red')
                }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div>
                    {record.status === 'pending' && (
                        <>
                            <Button 
                                type="link" 
                                onClick={() => handleAppointmentStatus(record._id, 'confirmed')}
                            >
                                Confirm
                            </Button>
                            <Button 
                                type="link" 
                                danger 
                                onClick={() => handleAppointmentStatus(record._id, 'cancelled')}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {record.status === 'confirmed' && (
                        <Upload 
                            beforeUpload={file => {
                                handleCompleteAppointment(record._id, file); // Handle file upload
                                return false; // Prevent automatic upload
                            }}
                            showUploadList={false}
                        >
                            <Button type="primary">Upload Prescription</Button>
                        </Upload>
                    )}
                </div>
            ),
        },
    ];

    const dateCellRender = (value) => {
        const date = value.format('YYYY-MM-DD');
        const dateAppointments = appointments.filter(
            app => moment(app.appointmentDate).format('YYYY-MM-DD') === date
        );
        const dateBlockedSlots = blockedSlots.filter(
            slot => moment(slot.date).format('YYYY-MM-DD') === date
        );

        return (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {dateAppointments.map((app, index) => (
                    <li key={`app-${index}`}>
                        <Badge 
                            status={app.status === 'confirmed' ? 'success' : 'processing'} 
                            text={`${app.appointmentTime} - Patient`} 
                        />
                    </li>
                ))}
                {dateBlockedSlots.map((slot, index) => (
                    <li key={`block-${index}`}>
                        <Badge 
                            status="error" 
                            text={`${slot.time} - Blocked`} 
                        />
                    </li>
                ))}
            </ul>
        );
    };

    const handleLogout = () => {
        localStorage.clear();
        message.success('Logged out successfully');
        navigate('/login');
    };

    const handleMenuClick = (key) => {
        setCurrentPage(key); // Update the current page based on the selected menu item
    };

    const renderContent = () => {
        switch (currentPage) {
            case '1':
                return (
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Dashboard" key="1">
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Total Appointments"
                                            value={statistics.totalAppointments}
                                            prefix={<CalendarOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Pending Appointments"
                                            value={statistics.pendingAppointments}
                                            prefix={<ClockCircleOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title="Today's Appointments"
                                            value={statistics.todayAppointments}
                                            prefix={<UserOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="Appointments" key="2">
                            <Table 
                                columns={appointmentColumns} 
                                dataSource={appointments}
                                rowKey="_id"
                            />
                        </TabPane>

                        <TabPane tab="Schedule" key="3">
                            <Button 
                                type="primary" 
                                onClick={() => {
                                    setSelectedDate(moment());
                                    setIsModalVisible(true);
                                }}
                                style={{ marginBottom: 16 }}
                            >
                                Block Time Slot
                            </Button>
                            <Calendar 
                                dateCellRender={dateCellRender}
                                onSelect={(date) => {
                                    setSelectedDate(date);
                                    setIsModalVisible(true);
                                }}
                            />
                        </TabPane>
                    </Tabs>
                );
            case '2':
                return <div>Appointments Content</div>; // Replace with actual appointments content
            case '3':
                return <div>Schedule Content</div>; // Replace with actual schedule content
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
                    <Menu.Item key="2" icon={<CalendarOutlined />}>
                        Appointments
                    </Menu.Item>
                    <Menu.Item key="3" icon={<ClockCircleOutlined />}>
                        Schedule
                    </Menu.Item>
                    <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>
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
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    zIndex: 1
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1890ff' }}>Doctor Dashboard</h2> {/* Title */}
                    <span style={{ 
                        fontSize: '16px',
                        color: '#1890ff'
                    }}>
                        Welcome, Dr. {user?.name}
                    </span>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
                    {renderContent()} {/* Render content based on the current page */}
                </Content>
            </Layout>

            <Modal
                title="Block Time Slot"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleBlockSlot} layout="vertical">
                    <Form.Item
                        name="time"
                        label="Time"
                        rules={[{ required: true, message: 'Please select time!' }]}
                    >
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please enter reason!' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Block Slot
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default DoctorPage;
