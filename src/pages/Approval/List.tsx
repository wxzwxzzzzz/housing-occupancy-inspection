import React, { useEffect, useState } from 'react'
import { Table, Button, Space } from 'antd'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ApprovalList: React.FC = () => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // mock fetch
    setData([
      { id: '1', applicant: '张三', type: '请假', status: '待初审' },
      { id: '2', applicant: '李四', type: '备案', status: '已通过' }
    ])
  }, [])

  const cols = [
    { title: 'ID', dataIndex: 'id' },
    { title: '申请人', dataIndex: 'applicant' },
    { title: '类型', dataIndex: 'type' },
    { title: '状态', dataIndex: 'status' },
    { title: '操作', render: (_: any, row: any) => (
      <Space>
        <Link to={`/approval/${row.id}`}>详情</Link>
      </Space>
    )}
  ]

  return <Table dataSource={data} columns={cols} rowKey="id" />
}

export default ApprovalList