import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Tabs, Space } from 'antd';
import { LockOutlined, MobileOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { userStore } from '@/stores';
import { OntologyError } from '@/services/ontology/result';
import './index.less';

type LoginType = 'account' | 'phone';

const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [countdown, setCountdown] = useState(0);
  const [accountForm] = Form.useForm();
  const [phoneForm] = Form.useForm();

  const onAccountLogin = async (values: { username: string; password: string }) => {
    const result = await userStore.login({
      account: values.username,
      password: values.password,
    });
    if (result.ok) {
      message.success('登录成功');
      history.replace('/dashboard');
      return;
    }

    if (result.error instanceof OntologyError && result.error.fieldErrors.length > 0) {
      accountForm.setFields(
        result.error.fieldErrors.map((e) => {
          const name = e.path.includes('.') ? e.path.split('.').pop()! : e.path;
          const remap = name === 'account' ? 'username' : name;
          return { name: remap, errors: [e.message] };
        }),
      );
      return;
    }
    message.error(result.error?.message ?? '登录失败,请检查账号密码');
  };

  const onPhoneLogin = async (values: { phone: string; code: string }) => {
    const result = await userStore.login({ phone: values.phone, code: values.code });
    if (result.ok) {
      message.success('登录成功');
      history.replace('/dashboard');
      return;
    }
    if (result.error instanceof OntologyError && result.error.fieldErrors.length > 0) {
      phoneForm.setFields(
        result.error.fieldErrors.map((e) => {
          const name = e.path.includes('.') ? e.path.split('.').pop()! : e.path;
          return { name, errors: [e.message] };
        }),
      );
      return;
    }
    message.error(result.error?.message ?? '登录失败,请检查手机号和验证码');
  };

  const sendSmsCode = async () => {
    const phone: string = phoneForm.getFieldValue('phone');
    if (!phone) {
      message.warning('请输入手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号');
      return;
    }
    message.success('验证码已发送(Mock 任意 4-6 位数字均可)');
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
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-overlay" />
      </div>

      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <SafetyOutlined style={{ fontSize: 48, color: '#1d4ed8' }} />
            </div>
            <h1 className="login-title">公租房监测系统</h1>
            <p className="login-subtitle">审批端管理平台</p>
          </div>

          <Tabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as LoginType)}
            centered
            items={[
              {
                key: 'account',
                label: '账号登录',
                children: (
                  <Form form={accountForm} onFinish={onAccountLogin} size="large">
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
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={userStore.loading}
                        block
                      >
                        登录
                      </Button>
                    </Form.Item>

                    <div className="login-extra">
                      <a>忘记密码?</a>
                    </div>
                  </Form>
                ),
              },
              {
                key: 'phone',
                label: '手机登录',
                children: (
                  <Form form={phoneForm} onFinish={onPhoneLogin} size="large">
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
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
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={userStore.loading}
                        block
                      >
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />

          <div className="login-tips">
            <p>测试账号:</p>
            <p>账号登录:admin / 123456</p>
            <p>账号登录:approver / 123456</p>
            <p>手机登录:13800000000 / 任意 4-6 位验证码</p>
          </div>
        </Card>

        <div className="login-footer">
          <p>公租房保障居住状况动态监测系统 v1.0</p>
          <p>© 2025 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
