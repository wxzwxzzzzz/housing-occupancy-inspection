import React from 'react';
import { Card, Empty } from 'antd';

const SystemUser: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="用户管理">
        <Empty description="功能开发中..." />
      </Card>
    </div>
  );
};

export default SystemUser;
