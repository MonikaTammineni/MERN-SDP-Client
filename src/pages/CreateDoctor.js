import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const CreateDoctor = () => {
  const onFinish = async (values) => {
    try {
      const res = await axios.post(url+'/doctor/create', values);
      if (res.data.success) {
        message.success('Doctor created successfully!');
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('Something went wrong!');
    }
  };

  return (
    <div>
      <h3>Create Doctor</h3>
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
          Create Doctor
        </Button>
      </Form>
    </div>
  );
};

export default CreateDoctor;
