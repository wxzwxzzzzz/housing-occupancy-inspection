import React from 'react';
import { Card, Empty } from 'antd';

const SystemMessage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="消息中心">
        <Empty description="功能开发中..." />
      </Card>
    </div>
  );
};

export default SystemMessage;
