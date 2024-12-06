import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, DatePicker, TimePicker, message,List, Row, Col, Typography, Tag, Spin, Empty } from 'antd';
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
import url from '../variables';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

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
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
        fetchRecords();
    }, []);

    useEffect(() => {
        if (currentPage === '5') { // Assuming '5' is your Records tab key
            fetchPrescriptions();
        }
    }, [currentPage]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await axios.get(url+'/user/doctors', {
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
            const res = await axios.get(url+'/user/appointments', {
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

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(url+'/user/records', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(response.data.records);
        } catch (error) {
            console.error('Error fetching records:', error);
            message.error('Error fetching records');
        }
    };

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            console.log('Fetching prescriptions...');
            
            const token = localStorage.getItem('token');
            console.log('Using token:', token);

            const res = await axios.get(url+'/user/prescriptions', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Prescription response:', res.data);

            if (res.data.success) {
                setPrescriptions(res.data.data);
                if (res.data.data.length === 0) {
                    message.info('No prescriptions found');
                }
            } else {
                throw new Error(res.data.message || 'Failed to fetch prescriptions');
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            message.error('Failed to fetch prescriptions: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
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
                url+'/user/book-appointment',
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

    const renderContent = () => {
        switch (currentPage) {
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
            case '5': // Records
                return (
                    <div style={{ padding: '20px' }}>
                        <h2>Medical Records & Prescriptions</h2>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <>
                                <Table
                                    dataSource={prescriptions}
                                    rowKey="_id"
                                    columns={[
                                        {
                                            title: 'Date',
                                            dataIndex: 'appointmentDate',
                                            render: (text) => moment(text).format('YYYY-MM-DD')
                                        },
                                        {
                                            title: 'Doctor',
                                            dataIndex: ['doctor', 'name'],
                                            render: (text) => text ? `Dr. ${text}` : 'N/A'
                                        },
                                        {
                                            title: 'Status',
                                            dataIndex: 'status',
                                            render: (status) => (
                                                <Tag color={status === 'completed' ? 'green' : 'orange'}>
                                                    {status.toUpperCase()}
                                                </Tag>
                                            )
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (_, record) => (
                                                <Button
                                                    type="primary"
                                                    onClick={() => {
                                                        console.log('Full record:', record);
                                                        if (record.prescriptionDetails) {
                                                            setSelectedPrescription(record.prescriptionDetails);
                                                            setPrescriptionModalVisible(true);
                                                        } else {
                                                            message.info('No prescription available for this appointment');
                                                        }
                                                    }}
                                                >
                                                    View Prescription
                                                </Button>
                                            )
                                        }
                                    ]}
                                />

                                <Modal
                                    title="Prescription Details"
                                    open={prescriptionModalVisible}
                                    onCancel={() => {
                                        setPrescriptionModalVisible(false);
                                        setSelectedPrescription(null);
                                    }}
                                    footer={[
                                        <Button key="close" onClick={() => {
                                            setPrescriptionModalVisible(false);
                                            setSelectedPrescription(null);
                                        }}>
                                            Close
                                        </Button>
                                    ]}
                                    width={700}
                                >
                                    {selectedPrescription ? (
                                        <div>
                                            <Card title="Prescribed Medicines" style={{ marginBottom: '16px' }}>
                                                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                                                    <List
                                                        dataSource={selectedPrescription.medicines}
                                                        renderItem={(medicine, index) => (
                                                            <List.Item>
                                                                <Card 
                                                                    type="inner" 
                                                                    title={`Medicine ${index + 1}`} 
                                                                    style={{ width: '100%' }}
                                                                >
                                                                    <Row gutter={[16, 16]}>
                                                                        <Col span={8}>
                                                                            <Text strong>Name:</Text>
                                                                            <br />
                                                                            {medicine.name}
                                                                        </Col>
                                                                        <Col span={8}>
                                                                            <Text strong>Dosage:</Text>
                                                                            <br />
                                                                            {medicine.dosage}
                                                                        </Col>
                                                                        <Col span={8}>
                                                                            <Text strong>Duration:</Text>
                                                                            <br />
                                                                            {medicine.duration} days
                                                                        </Col>
                                                                    </Row>
                                                                </Card>
                                                            </List.Item>
                                                        )}
                                                    />
                                                ) : (
                                                    <Empty description="No medicines listed" />
                                                )}
                                            </Card>

                                            {selectedPrescription.instructions && (
                                                <Card title="Doctor's Instructions" style={{ marginBottom: '16px' }}>
                                                    <p>{selectedPrescription.instructions}</p>
                                                </Card>
                                            )}

                                            {selectedPrescription.prescribedDate && (
                                                <div style={{ textAlign: 'right' }}>
                                                    <Text type="secondary">
                                                        Prescribed on: {moment(selectedPrescription.prescribedDate).format('MMMM Do YYYY, h:mm a')}
                                                    </Text>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Empty description="No prescription details available" />
                                    )}
                                </Modal>
                            </>
                        )}
                    </div>
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
                    defaultSelectedKeys={['1']}
                    mode="inline"
                    onClick={({ key }) => handleMenuClick(key)}
                >
                    <Menu.Item key="1" icon={<DashboardOutlined />}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item key="2" icon={<UserOutlined />}>
                        Doctors
                    </Menu.Item>
                    <Menu.Item key="3" icon={<CalendarOutlined />}>
                        Appointments
                    </Menu.Item>
                    <Menu.Item key="5" icon={<FileTextOutlined />}>
                        Records
                    </Menu.Item>
                    <Menu.Item key="6" icon={<LogoutOutlined />} onClick={handleLogout}>
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
