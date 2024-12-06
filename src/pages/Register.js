import React, { useState } from "react";
import { Form, Input, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinishHandler = async (values) => {
        try {
            setLoading(true);
            const res = await axios.post(url+"/user/register", values);
            
            if (res.data.success) {
                message.success("Registration Successful!");
                navigate("/login");
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error("Registration error:", error);
            message.error(
                error.response?.data?.message || 
                "Something went wrong during registration"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <ArrowLeftOutlined 
                    style={{ 
                        fontSize: '24px', 
                        cursor: 'pointer', 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px'
                    }} 
                    onClick={() => navigate('/')}
                />
            </div>
            <Form layout="vertical" onFinish={onFinishHandler} className="register-form">
                <h3 className="text-center">Register Form</h3>
                
                <Form.Item 
                    label="Name" 
                    name="name"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                >
                    <Input type="text" />
                </Form.Item>
                
                <Form.Item 
                    label="Email" 
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                >
                    <Input type="email" />
                </Form.Item>
                
                <Form.Item 
                    label="Password" 
                    name="password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Link to="/login" className="m-2">
                    Already a user? Login here
                </Link>
                
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <Spin /> : 'Register'}
                </button>
            </Form>
        </div>
    );
};

export default Register;
