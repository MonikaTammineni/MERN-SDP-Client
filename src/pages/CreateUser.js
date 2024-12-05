import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const CreateUser = () => {
  const onFinish = async (values) => {
    try {
      const res = await axios.post('http://localhost:8080/api/v1/user/create', values);
      if (res.data.success) {
        message.success('User created successfully!');
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('Something went wrong!');
    }
  };

  return (
    <div>
      <h3>Create User</h3>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter the name' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter the email' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter the password' }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Create User
        </Button>
      </Form>
    </div>
  );
};

export default CreateUser;
