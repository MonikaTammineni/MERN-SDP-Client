import React, { useState } from "react";
import "../styles/Registerstyles.css";
import { Form, Input, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from "axios";
import url from '../variables';
const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinishHandler = async (values) => {
        try {
            setLoading(true);
            const res = await axios.post(url+"/user/login", values);
            
            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                message.success("Login Successfully!");
                console.log(res.data.user.role);
                // Navigate based on role
                switch(res.data.user.role) {
                    case "admin":
                        navigate("/admin-page");
                        break;
                    case "doctor":
                        navigate("/doctor-page");
                        break;
                    case "user":
                        navigate("/user-page");
                        break;
                    default:
                        navigate("/");
                }
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error(
                error.response?.data?.message || 
                "Something went wrong during login"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <ArrowLeftOutlined 
                    style={{ fontSize: '24px', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }}
                    onClick={() => navigate('/')}
                />
            </div>
            <Form layout="vertical" onFinish={onFinishHandler} className="register-form">
                <h3 className="text-center">Login Form</h3>
                
                <Form.Item 
                    label="Email" 
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                >
                    <Input type="email" />
                </Form.Item>
                
                <Form.Item 
                    label="Password" 
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Link to="/register" className="m-2">
                    Not registered? Register here
                </Link>
                
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <Spin /> : 'Login'}
                </button>
            </Form>
        </div>
    );
};

export default Login;
