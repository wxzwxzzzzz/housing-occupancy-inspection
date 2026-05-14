import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, List, Space, Tag } from 'antd';
import { invokeAction, invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';

const MSG_TYPE = 'cn.byteawake.prh.Message';

const LEVEL_COLOR: Record<string, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
};

interface MessageRow {
  id: string;
  title: string;
  content: string;
  level: string;
  read: boolean;
  createAt: string;
}

const SystemMessage: React.FC = () => {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const env = await invokeQuery<MessageRow>(
        MSG_TYPE,
        qb(MSG_TYPE).orderBy('createAt', 'DESC').page(1, 100).build(),
      );
      setRows(env.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const markRead = async (row: MessageRow) => {
    await invokeAction({
      objectType: MSG_TYPE,
      actionName: 'modify',
      payload: { id: row.id, read: true },
    });
    load();
  };

  const unreadCount = rows.filter((r) => !r.read).length;

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            消息中心
            <Badge count={unreadCount} />
          </Space>
        }
        extra={<Button onClick={load}>刷新</Button>}
      >
        <List
          loading={loading}
          dataSource={rows}
          renderItem={(item) => (
            <List.Item
              actions={[
                !item.read && (
                  <a key="read" onClick={() => markRead(item)}>
                    标记已读
                  </a>
                ),
              ].filter(Boolean) as any}
            >
              <List.Item.Meta
                avatar={<Tag color={LEVEL_COLOR[item.level] ?? 'default'}>{item.level}</Tag>}
                title={
                  <Space>
                    {item.title}
                    {!item.read && <Badge status="processing" text="未读" />}
                  </Space>
                }
                description={
                  <Space direction="vertical">
                    <span>{item.content}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>
                      {item.createAt ? new Date(item.createAt).toLocaleString() : '-'}
                    </span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default SystemMessage;
