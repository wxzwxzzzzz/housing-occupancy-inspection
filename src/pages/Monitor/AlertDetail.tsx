import React from 'react';
import { Card, Empty, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';

const AlertDetail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>
      <Card title="预警详情">
        <Empty description="功能开发中..." />
      </Card>
    </div>
  );
};

export default AlertDetail;
