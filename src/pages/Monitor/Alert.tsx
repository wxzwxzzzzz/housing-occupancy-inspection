import React from 'react';
import { Card, Empty } from 'antd';

const MonitorAlert: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="预警处置">
        <Empty description="功能开发中..." />
      </Card>
    </div>
  );
};

export default MonitorAlert;
