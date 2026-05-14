import React from 'react';
import { Card, Empty } from 'antd';

const SystemLog: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="日志审计">
        <Empty description="功能开发中..." />
      </Card>
    </div>
  );
};

export default SystemLog;
