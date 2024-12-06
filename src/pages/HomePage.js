import React, { useState } from 'react';
import { Layout, Card, Row, Col, Image, Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Logo from '../components/logo.png';
import axios from 'axios';
import { message } from 'antd';
import url from '../variables';
const { Header, Content, Footer } = Layout;

const hospitalBlue = '#4a90e2';
const lightGray = '#f5f7fa';

const HomePage = () => {
    const [messageData, setMessageData] = useState({
        email: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    const handleMessageSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSending(true);
            console.log('Sending message data:', messageData); // Debug log

            const res = await axios.post(
                url+'/messages', 
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Response:', res.data); // Debug log

            if (res.data.success) {
                message.success('Message sent successfully');
                // Clear the form
                setMessageData({
                    email: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            message.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <Layout style={{ backgroundColor: 'black', color: hospitalBlue, minHeight: '100vh' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: lightGray, zIndex: 1000 }}>
                <img src={Logo} alt="Logo" style={{ width: '100px' }} />
                <h1 style={{ flexGrow: 1, textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>Hospital Management System</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/login" style={{ ...buttonStyle, backgroundColor: 'white' }}>Login</Link>
                    <Link to="/register" style={{ ...buttonStyle, backgroundColor: 'white' }}>Register</Link>
                </div>
            </Header>
            <Content style={{ padding: '20px', backgroundColor: 'white' }}>
                {/* Hospital Image from Public Folder */}
                <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                    <Image 
                        src="hospital image.jpg" 
                        alt="Hospital" 
                        preview={false} 
                        style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px' }} 
                    />
                </div>

                {/* Enhanced Welcome Section */}
                <div style={{ margin: '20px 0', padding: '20px', backgroundColor: 'rgba(74, 144, 226, 0.8)', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}>
                    <h1 style={{ color: '#fff', textAlign: 'center' }}>Welcome to Our Caring Community</h1>
                    <p style={{ color: '#fff', textAlign: 'center' }}>
                        At our hospital, we prioritize your health and well-being. Our dedicated team of professionals is here to provide you with the highest quality of medical care in a compassionate environment.
                    </p>
                    <p style={{ color: '#fff', textAlign: 'center' }}>
                        With state-of-the-art technology and a commitment to excellence, we ensure that you receive the best possible treatment tailored to your needs.
                    </p>
                </div>

                <h2 style={{ fontSize: '28px', color: hospitalBlue, margin: '40px 0 20px' }}>Our Services</h2>
                <Row gutter={16} style={{ margin: '20px 0', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                    <Col span={8}>
                        <Card title="Emergency Care" bordered={false} style={{ height: '350px', backgroundColor: 'white', color: hospitalBlue }}>
                            <Image src="emergency.webp" alt="Emergency Care" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} preview={false} />
                            <p>24/7 emergency services with qualified personnel ready to assist you.</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Outpatient Services" bordered={false} style={{ height: '350px', backgroundColor: 'white', color: hospitalBlue }}>
                            <Image src="op.jpg" alt="Outpatient Services" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} preview={false} />
                            <p>Comprehensive outpatient services to meet your healthcare needs.</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Surgery" bordered={false} style={{ height: '350px', backgroundColor: 'white', color: hospitalBlue }}>
                            <Image src="surgery.jpg" alt="Surgery" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} preview={false} />
                            <p>Advanced surgical facilities with highly skilled surgeons.</p>
                        </Card>
                    </Col>
                </Row>

                <h2 style={{ fontSize: '28px', color: hospitalBlue, margin: '40px 0 20px' }}>About Us</h2>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                    <p>
                        Our hospital has been serving the community for over 30 years. We believe in compassionate care and strive to provide the best possible patient experience. 
                        Our team of experts is dedicated to treating each patient with respect and dignity.
                    </p>
                    <Image src="aboutus.avif" alt="About Us" style={{ width: '100%', borderRadius: '10px' }} preview={false} />
                </div>

                <h2 style={{ fontSize: '28px', color: hospitalBlue, margin: '40px 0 20px' }}>Our Doctors</h2>
                <Row gutter={16} style={{ margin: '20px 0' }}>
                    <Col span={8}>
                        <Card title="Dr. John Smith" bordered={false} style={{ height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Image src="john.jpg" alt="Dr. John Smith" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} preview={false} />
                            <div>
                                <p>Specialization: Cardiology</p>
                                <p>Experience: 10 years</p>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Dr. Sarah Johnson" bordered={false} style={{ height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Image src="sarah.jpeg" alt="Dr. Sarah Johnson" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} preview={false} />
                            <div>
                                <p>Specialization: Neurology</p>
                                <p>Experience: 8 years</p>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Dr. Emily Brown" bordered={false} style={{ height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Image src="emily.jpeg" alt="Dr. Emily Brown" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} preview={false} />
                            <div>
                                <p>Specialization: Orthopedics</p>
                                <p>Experience: 5 years</p>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <div style={{ padding: '40px', backgroundColor: hospitalBlue, color: 'white' }}>
                    <h2 style={{ textAlign: 'center' }}>Contact Us</h2>
                    <p style={{ textAlign: 'center' }}>123 Health Street, Cityville, ST 12345</p>
                    <p style={{ textAlign: 'center' }}>Phone: (123) 456-7890</p>
                    <h3 style={{ textAlign: 'center' }}>Get in Touch</h3>
                    <form 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        onSubmit={handleMessageSubmit}
                    >
                        <input 
                            type="email" 
                            placeholder="Your Email" 
                            style={{ 
                                ...inputStyle, 
                                marginBottom: '15px',
                                color: 'black'
                            }}
                            value={messageData.email}
                            onChange={(e) => setMessageData(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            required
                        />
                        <textarea 
                            placeholder="Your Message" 
                            style={{ 
                                ...inputStyle, 
                                height: '100px', 
                                marginBottom: '15px',
                                color: 'black'
                            }}
                            value={messageData.message}
                            onChange={(e) => setMessageData(prev => ({
                                ...prev,
                                message: e.target.value
                            }))}
                            required
                        />
                        <button 
                            type="submit" 
                            style={{ 
                                ...buttonStyle, 
                                backgroundColor: sending ? '#ccc' : 'white', 
                                color: hospitalBlue,
                                cursor: sending ? 'not-allowed' : 'pointer',
                                width: '200px'
                            }}
                            disabled={sending}
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </Content>

            {/* Footer Section */}
            <Footer style={{ backgroundColor: lightGray, color: 'black', textAlign: 'center', padding: '20px' }}>
                <p>Hospital Management System ©{new Date().getFullYear()} Created by 2300032536, 2300033403 AND 2300031868 </p>
            </Footer>
        </Layout>
    );
};

// Button style
const buttonStyle = {
    color: hospitalBlue,
    padding: '10px 20px',
    border: `1px solid ${hospitalBlue}`,
    borderRadius: '5px',
    textDecoration: 'none',
    transition: 'background-color 0.3s, color 0.3s',
};

// Input style
const inputStyle = {
    width: '80%',
    maxWidth: '500px',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '5px',
    border: 'none',
    color: 'black',
};

export default HomePage;

