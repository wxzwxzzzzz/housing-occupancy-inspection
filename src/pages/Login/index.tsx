import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Tabs, Space } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { userStore } from '../../stores';
import './index.less';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'account' | 'phone'>('account');
  const [countdown, setCountdown] = useState(0);

  // 账号密码登录
  const onAccountLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // TODO: 调用实际登录 API
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络请求

      // Mock 登录成功
      userStore.setUser({
        name: values.username,
        role: 'approver',
        permissions: ['approval:view', 'approval:handle', 'dashboard:view']
      });

      message.success('登录成功');
      history.push('/dashboard');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // 手机号验证码登录
  const onPhoneLogin = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      // TODO: 调用实际验证码登录 API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock 登录成功
      userStore.setUser({
        name: values.phone,
        role: 'approver',
        permissions: ['approval:view', 'approval:handle', 'dashboard:view']
      });

      message.success('登录成功');
      history.push('/dashboard');
    } catch (error) {
      message.error('登录失败，请检查手机号和验证码');
    } finally {
      setLoading(false);
    }
  };

  // 发送验证码
  const sendSmsCode = async () => {
    const form = Form.useFormInstance();
    const phone = form.getFieldValue('phone');

    if (!phone) {
      message.warning('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号');
      return;
    }

    try {
      // TODO: 调用发送验证码 API
      await new Promise(resolve => setTimeout(resolve, 300));

      message.success('验证码已发送');
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      message.error('验证码发送失败');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-overlay" />
      </div>

      <div className="login-content">
        <Card className="login-card">
          {/* 系统标题 */}
          <div className="login-header">
            <div className="login-logo">
              <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </div>
            <h1 className="login-title">公租房监测系统</h1>
            <p className="login-subtitle">审批端管理平台</p>
          </div>

          {/* 登录表单 */}
          <Tabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as 'account' | 'phone')}
            centered
            items={[
              {
                key: 'account',
                label: '账号登录',
                children: (
                  <Form onFinish={onAccountLogin} size="large">
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="请输入用户名"
                        autoComplete="username"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="请输入密码"
                        autoComplete="current-password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading} block>
                        登录
                      </Button>
                    </Form.Item>

                    <div className="login-extra">
                      <a>忘记密码？</a>
                    </div>
                  </Form>
                ),
              },
              {
                key: 'phone',
                label: '手机登录',
                children: (
                  <Form onFinish={onPhoneLogin} size="large">
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                      ]}
                    >
                      <Input
                        prefix={<MobileOutlined />}
                        placeholder="请输入手机号"
                        maxLength={11}
                      />
                    </Form.Item>

                    <Form.Item
                      name="code"
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          prefix={<SafetyOutlined />}
                          placeholder="请输入验证码"
                          maxLength={6}
                        />
                        <Button
                          onClick={sendSmsCode}
                          disabled={countdown > 0}
                          style={{ width: 120 }}
                        >
                          {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                        </Button>
                      </Space.Compact>
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading} block>
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />

          {/* 测试账号提示 */}
          <div className="login-tips">
            <p>测试账号：</p>
            <p>账号登录：admin / 任意密码</p>
            <p>手机登录：任意手机号 / 任意验证码</p>
          </div>
        </Card>

        {/* 底部信息 */}
        <div className="login-footer">
          <p>公租房保障居住状况动态监测系统 v1.0</p>
          <p>© 2025 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
