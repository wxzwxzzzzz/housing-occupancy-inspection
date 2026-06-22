/**
 * 通用附件 Tab — 适用于 LeaveAttachment / AttendanceMakeupAttachment
 *
 * 功能:
 *   - 列出所有附件(按 createAt 倒序)
 *   - 拖拽 / 选择上传(实际项目走 OSS,这里 mock 为 ObjectURL)
 *   - 删除某条附件
 *
 * 用法:
 *   <AttachmentTab
 *     service={leaveAttachmentService}
 *     ownerField="leave"
 *     ownerId={leaveId}
 *   />
 */

import {
  DeleteOutlined,
  FileOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Empty, List, message, Popconfirm, Space, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import type { EntityApi } from '@/services/ontology/crud';
import { qb } from '@/services/ontology/query';

export interface AttachmentTabProps {
  /** 附件 service,如 leaveAttachmentService */
  service: EntityApi<any>;
  /** 关联字段名(在附件实体上),如 'leave' / 'makeup' */
  ownerField: 'leave' | 'makeup' | string;
  /** 关联实体 id */
  ownerId: string;
  /** 是否只读(默认 false) */
  readonly?: boolean;
}

const AttachmentTab: React.FC<AttachmentTabProps> = ({
  service,
  ownerField,
  ownerId,
  readonly = false,
}) => {
  const objectType = service.objectType;
  const [uploading, setUploading] = useState(false);

  const { data: list = [], refresh } = useRequest(
    async () => {
      if (!ownerId) return [];
      const env = await service.list(
        qb(objectType)
          .eq(ownerField, ownerId)
          .orderBy('createAt', 'DESC')
          .page(1, 100)
          .build() as any,
      );
      return env.data;
    },
    { refreshDeps: [ownerId, objectType] },
  );

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // 实际项目应先把 file 上传到 OSS,拿到 url 再 add 附件记录
      const url = URL.createObjectURL(file);
      await service.add({
        [ownerField]: ownerId,
        file: {
          name: file.name,
          url,
          mimeType: file.type,
        },
      } as any);
      message.success(`${file.name} 上传成功`);
      refresh();
    } catch (err: any) {
      message.error(err?.message ?? '上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止 antd 默认上传
  };

  const handleDelete = async (id: string) => {
    try {
      await service.delete(id);
      message.success('已删除');
      refresh();
    } catch (err: any) {
      message.error(err?.message ?? '删除失败');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {!readonly && (
        <div style={{ marginBottom: 12 }}>
          <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
            <Button
              icon={<UploadOutlined />}
              type="primary"
              loading={uploading}
            >
              上传
            </Button>
          </Upload>
          <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
            支持图片 / PDF / Office 文档,单文件最大 50MB
          </span>
        </div>
      )}

      {list.length === 0 ? (
        <Empty description="暂无附件" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={list}
          renderItem={(item: any) => {
            const file = item.file ?? {};
            return (
              <List.Item
                actions={
                  readonly
                    ? [
                        <a
                          key="download"
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          下载
                        </a>,
                      ]
                    : [
                        <a
                          key="download"
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          下载
                        </a>,
                        <Popconfirm
                          key="delete"
                          title="删除该附件?"
                          okText="确认"
                          cancelText="取消"
                          onConfirm={() => handleDelete(item.id)}
                        >
                          <a style={{ color: '#cf1322' }}>
                            <DeleteOutlined /> 删除
                          </a>
                        </Popconfirm>,
                      ]
                }
              >
                <List.Item.Meta
                  avatar={
                    <FileOutlined style={{ fontSize: 22, color: 'var(--ant-color-primary, #066fd1)' }} />
                  }
                  title={file.name ?? `#${String(item.id).slice(-6)}`}
                  description={
                    <Space size={12}>
                      <span style={{ color: '#888' }}>
                        {file.mimeType ?? '-'}
                      </span>
                      <span style={{ color: '#888' }}>
                        {item.creator ?? '-'} · {item.createAt ?? ''}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default AttachmentTab;
