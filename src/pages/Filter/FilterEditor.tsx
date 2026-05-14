import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Button, Space, Card, Typography, Divider, Alert } from 'antd';
import { SaveOutlined, UndoOutlined, CodeOutlined } from '@ant-design/icons';

// Query Builder imports - 使用 Ant Design 版本
import {
  Query,
  Builder,
  Utils as QbUtils,
  type ImmutableTree,
  type Config,
  type BuilderProps,
} from '@react-awesome-query-builder/antd';
import { AntdConfig } from '@react-awesome-query-builder/antd';

// 样式
import '@react-awesome-query-builder/antd/css/styles.css';

const { Text } = Typography;

// 初始配置 - 扩展 Antd 配置
const InitialConfig: Config = {
  ...AntdConfig,
  fields: {
    // 房屋相关字段
    houseArea: {
      label: '房屋面积',
      type: 'number',
      fieldSettings: {
        min: 0,
        max: 10000,
      },
      valueSources: ['value'],
      preferWidgets: ['number'],
    },
    houseType: {
      label: '房屋类型',
      type: 'select',
      valueSources: ['value'],
      fieldSettings: {
        listValues: [
          { value: 'apartment', title: '公寓' },
          { value: 'villa', title: '别墅' },
          { value: 'house', title: '住宅' },
          { value: 'commercial', title: '商业用房' },
        ],
      },
    },
    district: {
      label: '所属区域',
      type: 'select',
      valueSources: ['value'],
      fieldSettings: {
        listValues: [
          { value: 'dongcheng', title: '东城区' },
          { value: 'xicheng', title: '西城区' },
          { value: 'chaoyang', title: '朝阳区' },
          { value: 'haidian', title: '海淀区' },
          { value: 'fengtai', title: '丰台区' },
        ],
      },
    },
    // 入住相关字段
    occupancyDate: {
      label: '入住日期',
      type: 'date',
      valueSources: ['value'],
    },
    occupancyYears: {
      label: '入住年限',
      type: 'number',
      fieldSettings: {
        min: 0,
        max: 100,
      },
      valueSources: ['value'],
    },
    residentCount: {
      label: '入住人数',
      type: 'number',
      fieldSettings: {
        min: 0,
        max: 100,
      },
      valueSources: ['value'],
    },
    // 申请相关字段
    applicationStatus: {
      label: '申请状态',
      type: 'select',
      valueSources: ['value'],
      fieldSettings: {
        listValues: [
          { value: 'pending', title: '待审核' },
          { value: 'approved', title: '已通过' },
          { value: 'rejected', title: '已拒绝' },
          { value: 'cancelled', title: '已取消' },
        ],
      },
    },
    submitDate: {
      label: '提交日期',
      type: 'date',
      valueSources: ['value'],
    },
    applicantName: {
      label: '申请人姓名',
      type: 'text',
      valueSources: ['value'],
    },
    applicantPhone: {
      label: '申请人电话',
      type: 'text',
      valueSources: ['value'],
    },
    // 检查相关字段
    inspectionResult: {
      label: '检查结果',
      type: 'select',
      valueSources: ['value'],
      fieldSettings: {
        listValues: [
          { value: 'pass', title: '通过' },
          { value: 'fail', title: '不通过' },
          { value: 'pending', title: '待检查' },
        ],
      },
    },
    hasViolation: {
      label: '是否违规',
      type: 'boolean',
      valueSources: ['value'],
    },
    riskLevel: {
      label: '风险等级',
      type: 'select',
      valueSources: ['value'],
      fieldSettings: {
        listValues: [
          { value: 'low', title: '低风险' },
          { value: 'medium', title: '中风险' },
          { value: 'high', title: '高风险' },
        ],
      },
    },
  },
  settings: {
    ...AntdConfig.settings,
    showLabels: false,  // 关闭标签显示，使用左右结构
    showNot: true,     // 隐藏 NOT 按钮
    canReorder: true,
    canRegroup: true,
    maxNesting: 3,
    showErrorMessage: true,
    renderSize: 'middle',
  },
};

// 创建空的初始查询树
const createEmptyTree = () => QbUtils.checkTree(QbUtils.loadTree({ id: QbUtils.uuid(), type: 'group' }), InitialConfig);

interface FilterEditorProps {
  visible: boolean;
  filter: {
    id: string;
    name: string;
    description: string;
    jsonLogic: any;
  };
  onSave: (data: { jsonLogic: any; fieldCount: number }) => void;
  onCancel: () => void;
}

const FilterEditor: React.FC<FilterEditorProps> = ({ visible, filter, onSave, onCancel }) => {
  const [tree, setTree] = useState<ImmutableTree>(() => createEmptyTree());
  const [config] = useState<Config>(InitialConfig);
  const [showJsonLogic, setShowJsonLogic] = useState(false);

  // 重置到初始状态
  useEffect(() => {
    if (visible) {
      if (filter.jsonLogic) {
        try {
          setTree(
            QbUtils.checkTree(
              QbUtils.loadFromJsonLogic(filter.jsonLogic, InitialConfig),
              InitialConfig
            )
          );
        } catch (e) {
          console.error('Failed to load jsonLogic:', e);
          setTree(createEmptyTree());
        }
      } else {
        setTree(createEmptyTree());
      }
    }
  }, [visible, filter.jsonLogic]);

  // 处理查询变化
  const onChange = useCallback((immutableTree: ImmutableTree) => {
    setTree(immutableTree);
  }, []);

  // 重置查询
  const handleReset = () => {
    setTree(createEmptyTree());
  };

  // 保存
  const handleSave = () => {
    const jsonLogic = QbUtils.jsonLogicFormat(tree, config);
    const fieldCount = countFields(tree);

    console.log('JsonLogic:', jsonLogic);

    onSave({
      jsonLogic: jsonLogic.logic,
      fieldCount,
    });
  };

  // 计算条件数量
  const countFields = (tree: ImmutableTree): number => {
    const jsonTree = QbUtils.getTree(tree);
    let count = 0;

    const countRules = (node: any) => {
      if (node.type === 'rule') {
        count++;
      } else if (node.children1) {
        Object.values(node.children1).forEach((child) => countRules(child));
      }
    };

    countRules(jsonTree);
    return count;
  };

  // 获取当前的 SQL 和 JsonLogic
  const getCurrentFormats = () => {
    const jsonLogic = QbUtils.jsonLogicFormat(tree, config);
    const sql = QbUtils.sqlFormat(tree, config);
    const humanReadable = QbUtils.queryString(tree, config);

    return { jsonLogic, sql, humanReadable };
  };

  const formats = getCurrentFormats();

  const renderBuilder = useCallback(
    (props: BuilderProps) => (
      <div className="query-builder-container">
        <Builder {...props} />
      </div>
    ),
    []
  );

  return (
    <Modal
      title={`编辑筛选器: ${filter.name}`}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button icon={<UndoOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button
            icon={<CodeOutlined />}
            onClick={() => setShowJsonLogic(!showJsonLogic)}
          >
            {showJsonLogic ? '隐藏代码' : '查看代码'}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
      styles={{
        body: {
          maxHeight: '70vh',
          overflow: 'auto',
        },
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="使用说明"
          description="点击「+ 添加规则」添加筛选条件，点击「+ 添加组」创建条件组。支持 AND/OR 逻辑组合。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </div>

      {/* 查询构建器 */}
      <Card
        title="筛选条件"
        size="small"
        style={{ marginBottom: 16 }}
        styles={{
          body: {
            padding: '16px',
            background: '#fafafa',
          },
        }}
      >
        <Query
          {...config}
          value={tree}
          onChange={onChange}
          renderBuilder={renderBuilder}
        />
      </Card>

      {/* 可读格式预览 */}
      {formats.humanReadable && (
        <Card title="条件预览" size="small" style={{ marginBottom: 16 }}>
          <Text code style={{ fontSize: 13 }}>
            {formats.humanReadable || '（无条件）'}
          </Text>
        </Card>
      )}

      {/* 代码预览 */}
      {showJsonLogic && (
        <>
          <Divider />
          <Card title="SQL 格式" size="small" style={{ marginBottom: 16 }}>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                fontSize: 12,
                overflow: 'auto',
                maxHeight: 100,
              }}
            >
              {formats.sql || '（无条件）'}
            </pre>
          </Card>
          <Card title="JsonLogic 格式" size="small">
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                fontSize: 12,
                overflow: 'auto',
                maxHeight: 150,
              }}
            >
              {JSON.stringify(formats.jsonLogic, null, 2) || '（无条件）'}
            </pre>
          </Card>
        </>
      )}

      <style>{`
        /* 整体容器 */
        .query-builder-container {
          padding: 8px;
        }

        /* 组样式 */
        .query-builder-container .group {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 0;
        }

        .query-builder-container .group-or-rule-container {
          padding: 0;
          margin: 0;
        }

        /* 组头部 - AND/OR/NOT 和操作按钮 */
        .query-builder-container .group--header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          border-radius: 8px 8px 0 0;
        }

        /* AND/OR/NOT 按钮组 */
        .query-builder-container .group--conjunctions {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .query-builder-container .group--conjunctions .ant-btn {
          border-radius: 0;
          padding: 4px 12px;
          height: 28px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #d9d9d9;
          margin: 0;
        }

        .query-builder-container .group--conjunctions .ant-btn:first-child {
          border-radius: 4px 0 0 4px;
        }

        .query-builder-container .group--conjunctions .ant-btn:last-child {
          border-radius: 0 4px 4px 0;
        }

        .query-builder-container .group--conjunctions .ant-btn:not(:first-child) {
          margin-left: -1px;
        }

        /* NOT 按钮样式 - 红色文字 */
        .query-builder-container .group--conjunctions .ant-btn.ant-btn-default:not(.ant-btn-primary) {
          background: #fff;
          color: #ff4d4f;
          border-color: #d9d9d9;
        }

        /* AND/OR 选中状态 - 蓝色 */
        .query-builder-container .group--conjunctions .ant-btn-primary {
          background: #1890ff;
          border-color: #1890ff;
          color: #fff;
        }

        .query-builder-container .group--conjunctions .ant-btn-primary:hover {
          background: #40a9ff;
          border-color: #40a9ff;
        }

        /* 添加规则/添加组按钮 */
        .query-builder-container .group--actions {
          display: flex;
          gap: 8px;
        }

        .query-builder-container .group--actions .ant-btn {
          border-radius: 4px;
          padding: 4px 12px;
          height: 28px;
          font-size: 13px;
          background: #fff;
          border-color: #d9d9d9;
          color: #333;
        }

        .query-builder-container .group--actions .ant-btn:hover {
          color: #1890ff;
          border-color: #1890ff;
        }

        /* 组子元素容器 */
        .query-builder-container .group--children {
          padding: 8px 12px;
        }

        /* 规则行样式 */
        .query-builder-container .rule {
          display: flex;
          align-items: center;
          padding: 6px 0;
          gap: 8px;
          border-bottom: 1px solid #f5f5f5;
        }

        .query-builder-container .rule:last-child {
          border-bottom: none;
        }

        /* 拖拽手柄 */
        .query-builder-container .rule--drag-handler,
        .query-builder-container .group--drag-handler {
          cursor: grab;
          color: #bfbfbf;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .query-builder-container .rule--drag-handler:hover,
        .query-builder-container .group--drag-handler:hover {
          color: #8c8c8c;
        }

        /* 规则主体 */
        .query-builder-container .rule--body {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          flex-wrap: nowrap;
        }

        /* 字段选择器、操作符、值 - 圆角标签样式 */
        .query-builder-container .rule--field,
        .query-builder-container .rule--operator,
        .query-builder-container .rule--value {
          display: flex;
          align-items: center;
        }

        .query-builder-container .ant-select {
          min-width: auto;
        }

        .query-builder-container .ant-select-selector {
          border-radius: 16px !important;
          background: #f5f5f5 !important;
          border: 1px solid #e8e8e8 !important;
          padding: 0 12px !important;
          height: 28px !important;
          min-height: 28px !important;
        }

        .query-builder-container .ant-select-selection-item {
          line-height: 26px !important;
          font-size: 13px;
          color: #333;
        }

        .query-builder-container .ant-select-arrow {
          color: #999;
          font-size: 10px;
        }

        .query-builder-container .ant-select:hover .ant-select-selector {
          border-color: #d9d9d9 !important;
        }

        .query-builder-container .ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: none !important;
        }

        /* 输入框样式 - 圆角 */
        .query-builder-container .ant-input,
        .query-builder-container .ant-input-number {
          border-radius: 16px;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
          height: 28px;
          font-size: 13px;
          padding: 0 12px;
        }

        .query-builder-container .ant-input-number {
          width: 80px;
        }

        .query-builder-container .ant-input-number-input {
          height: 26px;
          padding: 0;
          text-align: center;
        }

        .query-builder-container .ant-input:hover,
        .query-builder-container .ant-input-number:hover {
          border-color: #d9d9d9;
        }

        .query-builder-container .ant-input:focus,
        .query-builder-container .ant-input-number:focus,
        .query-builder-container .ant-input-number-focused {
          border-color: #1890ff;
          box-shadow: none;
        }

        /* 日期选择器 */
        .query-builder-container .ant-picker {
          border-radius: 16px;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
          height: 28px;
        }

        /* 开关样式 */
        .query-builder-container .ant-switch {
          min-width: 36px;
        }

        /* 删除按钮 - 红色图标 */
        .query-builder-container .rule--header {
          margin-left: auto;
          display: flex;
          align-items: center;
        }

        .query-builder-container .rule--header .ant-btn {
          border: none;
          background: transparent;
          color: #ff4d4f;
          padding: 4px 8px;
          height: auto;
          box-shadow: none;
        }

        .query-builder-container .rule--header .ant-btn:hover {
          background: #fff1f0;
          color: #ff7875;
        }

        /* 隐藏widget标签 */
        .query-builder-container .rule--widget label.rule--label,
        .query-builder-container .widget--widget > label,
        .query-builder-container .widget--valuesrc,
        .query-builder-container .widget--sep {
          display: none !important;
        }

        /* widget容器左右结构 */
        .query-builder-container .rule--widget,
        .query-builder-container .widget--widget {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 8px;
        }

        /* 嵌套组样式 */
        .query-builder-container .group .group {
          margin: 8px 0;
          border-left: 3px solid #1890ff;
        }

        /* 删除组头部多余间距 */
        .query-builder-container .group--header .group--field,
        .query-builder-container .group--header .group--value {
          display: none;
        }
      `}</style>
    </Modal>
  );
};

export default FilterEditor;
