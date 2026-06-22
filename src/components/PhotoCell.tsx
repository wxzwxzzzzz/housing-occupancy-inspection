/**
 * 单文件上传 / 预览的小组件
 *
 * - 只读态:显示缩略图 + "查看大图"
 * - 编辑态:antd Upload(单文件,beforeUpload 拦截,实际项目走 OSS)
 *
 * 受控:value=string(URL),onChange(string|undefined)
 */

import { PictureOutlined } from '@ant-design/icons';
import { Button, Image, Space, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';

export interface PhotoCellProps {
  value?: string;
  onChange?: (v: string | undefined) => void;
  /** true=编辑(显示 Upload),false=只读(显示缩略图) */
  editing?: boolean;
  /** 占位文案,如"未上传" */
  placeholder?: string;
  /** 缩略图大小,默认 56 */
  size?: number;
}

const PhotoCell: React.FC<PhotoCellProps> = ({
  value,
  onChange,
  editing = false,
  placeholder = '未上传',
  size = 56,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    value
      ? [{ uid: '-1', name: value, status: 'done', url: value } as UploadFile]
      : [],
  );

  useEffect(() => {
    setFileList(
      value
        ? [{ uid: '-1', name: value, status: 'done', url: value } as UploadFile]
        : [],
    );
  }, [value]);

  if (!editing) {
    if (!value) {
      return (
        <span style={{ color: 'var(--ant-color-text-tertiary)' }}>
          <PictureOutlined style={{ marginRight: 4 }} />
          {placeholder}
        </span>
      );
    }
    return (
      <Image
        width={size}
        height={size}
        style={{ objectFit: 'cover' }}
        src={value}
      />
    );
  }

  return (
    <Upload
      maxCount={1}
      listType="picture"
      fileList={fileList}
      beforeUpload={(file) => {
        // 实际项目走 OSS,这里用 ObjectURL 占位
        const url = URL.createObjectURL(file);
        setFileList([
          { uid: file.uid, name: file.name, status: 'done', url } as UploadFile,
        ]);
        onChange?.(url);
        return false;
      }}
      onRemove={() => {
        setFileList([]);
        onChange?.(undefined);
        return true;
      }}
    >
      {fileList.length === 0 && (
        <Button size="small">
          上传
        </Button>
      )}
    </Upload>
  );
};

export default PhotoCell;
