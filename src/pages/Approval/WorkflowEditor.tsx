// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Card, Space, Button, Form, Input, Drawer, Switch, Select, message, Dropdown } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Graph, Shape } from '@antv/x6';

interface WorkflowEditorProps {
  workflowKey: string;
  workflowData: any;
  initialValues: {
    name: string;
    version: string;
    description: string;
  };
  onSave: (values: any, graphData: any) => void;
  onCancel: () => void;
}

// 审批节点类型定义
const approvalNodeTypes = [
  { type: 'start', text: '开始', color: '#52c41a', shape: 'circle' },
  { type: 'check', text: '材料校验', color: '#fa8c16', shape: 'rect' },
  { type: 'approve', text: '初审', color: '#1d4ed8', shape: 'rect' },
  { type: 'approve2', text: '复审', color: '#1d4ed8', shape: 'rect' },
  { type: 'approve3', text: '终审', color: '#1d4ed8', shape: 'rect' },
  { type: 'warning', text: '预警校验', color: '#fa8c16', shape: 'rect' },
  { type: 'condition', text: '条件判断', color: '#722ed1', shape: 'diamond' },
  { type: 'reject', text: '驳回', color: '#ff4d4f', shape: 'rect' },
  { type: 'end', text: '结束', color: '#ff4d4f', shape: 'circle' },
];

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflowKey,
  workflowData,
  initialValues,
  onSave,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [form] = Form.useForm();
  const [nodeForm] = Form.useForm();

  // 当前编辑的节点
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; type: string; target: any }>({
    visible: false,
    x: 0,
    y: 0,
    type: '',
    target: null,
  });

  // 初始化表单值
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  // 初始化 X6 Graph
  useEffect(() => {
    if (!containerRef.current) {
      console.error('Container ref not ready');
      return;
    }


    // 创建画布
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: 700,
      grid: {
        visible: true,
        type: 'dot',
        size: 10,
        args: {
          color: '#e6e6e6',
        },
      },
      background: {
        color: '#fafafa',
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: { radius: 8 },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: { radius: 20 },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#a2b1c3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#3b82f6',
              stroke: '#3b82f6',
            },
          },
        },
      },
      selecting: {
        enabled: true,
        rubberband: true,
        showNodeSelectionBox: true,
      },
      snapline: true,
      keyboard: true,
      clipboard: true,
    });

    graphRef.current = graph;

    // 注册快捷键
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.copy(cells);
      }
      return false;
    });

    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 });
        graph.cleanSelection();
        graph.select(cells);
      }
      return false;
    });

    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.canUndo()) {
        graph.undo();
      }
      return false;
    });

    graph.bindKey(['delete', 'backspace'], () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.removeCells(cells);
      }
      return false;
    });

    // 节点双击编辑
    graph.on('node:dblclick', ({ node }) => {
      const data = node.getData() || {};
      setCurrentNode(node);
      nodeForm.setFieldsValue({
        text: node.attr('label/text') || data.text || '',
        role: data.role || 'approver',
        needAdmin: data.needAdmin || false,
        timeout: data.timeout || 24,
        description: data.description || '',
      });
      setDrawerOpen(true);
    });

    // 右键菜单
    graph.on('node:contextmenu', ({ e, node }) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        type: 'node',
        target: node,
      });
    });

    graph.on('edge:contextmenu', ({ e, edge }) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        type: 'edge',
        target: edge,
      });
    });

    graph.on('blank:contextmenu', ({ e }) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        type: 'blank',
        target: null,
      });
    });

    // 点击空白处关闭菜单
    graph.on('blank:click', () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    });

    graph.on('node:click', () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    });

    // 加载已有数据或创建默认流程
    if (workflowData && workflowData.cells && workflowData.cells.length > 0) {
      try {
        graph.fromJSON(workflowData);
        graph.centerContent();
      } catch (error) {
        console.error('加载流程图失败:', error);
      }
    } else {
      // 创建默认流程：开始 -> 初审 -> 复审 -> 结束
      const startNode = graph.addNode({
        x: 100,
        y: 300,
        width: 60,
        height: 60,
        shape: 'circle',
        attrs: {
          body: { fill: '#52c41a', stroke: '#52c41a' },
          label: { text: '开始', fill: '#fff', fontSize: 12 },
        },
        data: { nodeType: 'start', text: '开始' },
        ports: {
          groups: {
            top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
          },
          items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
        },
      });

      const checkNode = graph.addNode({
        x: 240,
        y: 275,
        width: 120,
        height: 50,
        shape: 'rect',
        attrs: {
          body: { fill: '#fa8c16', stroke: '#fa8c16', rx: 6, ry: 6 },
          label: { text: '材料校验', fill: '#fff', fontSize: 14 },
        },
        data: { nodeType: 'check', text: '材料校验' },
        ports: {
          groups: {
            top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
          },
          items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
        },
      });

      const approveNode = graph.addNode({
        x: 440,
        y: 275,
        width: 120,
        height: 50,
        shape: 'rect',
        attrs: {
          body: { fill: '#1d4ed8', stroke: '#1d4ed8', rx: 6, ry: 6 },
          label: { text: '初审', fill: '#fff', fontSize: 14 },
        },
        data: { nodeType: 'approve', text: '初审' },
        ports: {
          groups: {
            top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
          },
          items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
        },
      });

      const reviewNode = graph.addNode({
        x: 640,
        y: 275,
        width: 120,
        height: 50,
        shape: 'rect',
        attrs: {
          body: { fill: '#1d4ed8', stroke: '#1d4ed8', rx: 6, ry: 6 },
          label: { text: '复审', fill: '#fff', fontSize: 14 },
        },
        data: { nodeType: 'approve2', text: '复审' },
        ports: {
          groups: {
            top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
          },
          items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
        },
      });

      const endNode = graph.addNode({
        x: 840,
        y: 300,
        width: 60,
        height: 60,
        shape: 'circle',
        attrs: {
          body: { fill: '#ff4d4f', stroke: '#ff4d4f' },
          label: { text: '结束', fill: '#fff', fontSize: 12 },
        },
        data: { nodeType: 'end', text: '结束' },
        ports: {
          groups: {
            top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
          },
          items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
        },
      });

      // 添加连线
      graph.addEdge({
        source: startNode,
        target: checkNode,
        attrs: {
          line: { stroke: '#a2b1c3', strokeWidth: 2, targetMarker: { name: 'block', width: 12, height: 8 } },
        },
      });

      graph.addEdge({
        source: checkNode,
        target: approveNode,
        attrs: {
          line: { stroke: '#a2b1c3', strokeWidth: 2, targetMarker: { name: 'block', width: 12, height: 8 } },
        },
      });

      graph.addEdge({
        source: approveNode,
        target: reviewNode,
        attrs: {
          line: { stroke: '#a2b1c3', strokeWidth: 2, targetMarker: { name: 'block', width: 12, height: 8 } },
        },
      });

      graph.addEdge({
        source: reviewNode,
        target: endNode,
        attrs: {
          line: { stroke: '#a2b1c3', strokeWidth: 2, targetMarker: { name: 'block', width: 12, height: 8 } },
        },
      });

      // 居中显示
      graph.centerContent();
    }

    // 监听窗口大小变化
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.resize(containerRef.current.offsetWidth, 700);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph.dispose();
    };
  }, [workflowData, nodeForm]);

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, nodeType: typeof approvalNodeTypes[0]) => {
    e.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽图像
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.7';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 12, 12);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // 拖拽放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const graph = graphRef.current;
    if (!graph || !containerRef.current) {
      console.error('Graph or container not ready');
      return;
    }

    const nodeTypeStr = e.dataTransfer.getData('nodeType');
    if (!nodeTypeStr) {
      console.error('No nodeType data');
      return;
    }

    const nodeType = JSON.parse(nodeTypeStr);
    const rect = containerRef.current.getBoundingClientRect();

    // 计算相对于画布容器的坐标
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 转换为画布坐标
    const localPoint = graph.clientToLocal({ x, y });
    const point = { x: localPoint.x, y: localPoint.y };


    try {
      // 创建节点
      let node;
      if (nodeType.shape === 'circle') {
        node = graph.addNode({
          x: point.x - 30,
          y: point.y - 30,
          width: 60,
          height: 60,
          shape: 'circle',
          attrs: {
            body: {
              fill: nodeType.color,
              stroke: nodeType.color,
            },
            label: {
              text: nodeType.text,
              fill: '#fff',
              fontSize: 12,
            },
          },
          data: {
            nodeType: nodeType.type,
            text: nodeType.text,
          },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            },
            items: [
              { group: 'top' },
              { group: 'bottom' },
              { group: 'left' },
              { group: 'right' },
            ],
          },
        });
      } else if (nodeType.shape === 'diamond') {
        node = graph.addNode({
          x: point.x - 40,
          y: point.y - 40,
          width: 80,
          height: 80,
          shape: 'polygon',
          attrs: {
            body: {
              fill: nodeType.color,
              stroke: nodeType.color,
              refPoints: '0,10 10,0 20,10 10,20',
            },
            label: {
              text: nodeType.text,
              fill: '#fff',
              fontSize: 12,
            },
          },
          data: {
            nodeType: nodeType.type,
            text: nodeType.text,
          },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            },
            items: [
              { group: 'top' },
              { group: 'bottom' },
              { group: 'left' },
              { group: 'right' },
            ],
          },
        });
      } else {
        node = graph.addNode({
          x: point.x - 60,
          y: point.y - 25,
          width: 120,
          height: 50,
          shape: 'rect',
          attrs: {
            body: {
              fill: nodeType.color,
              stroke: nodeType.color,
              rx: 6,
              ry: 6,
            },
            label: {
              text: nodeType.text,
              fill: '#fff',
              fontSize: 14,
            },
          },
          data: {
            nodeType: nodeType.type,
            text: nodeType.text,
          },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            },
            items: [
              { group: 'top' },
              { group: 'bottom' },
              { group: 'left' },
              { group: 'right' },
            ],
          },
        });
      }

      message.success(`已添加节点: ${nodeType.text}`);
    } catch (error) {
      console.error('Failed to create node:', error);
      message.error('添加节点失败');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  // 点击添加节点（备用方案）
  const handleClickAdd = (nodeType: typeof approvalNodeTypes[0]) => {
    const graph = graphRef.current;
    if (!graph) {
      console.error('Graph not initialized!');
      return;
    }

    // 获取画布视口中心位置
    const container = containerRef.current;
    let centerX = 400;
    let centerY = 300;

    if (container) {
      centerX = container.offsetWidth / 2 + Math.random() * 100 - 50;
      centerY = container.offsetHeight / 2 + Math.random() * 100 - 50;
    }

    try {
      let node;
      if (nodeType.shape === 'circle') {
        node = graph.addNode({
          x: centerX - 30,
          y: centerY - 30,
          width: 60,
          height: 60,
          shape: 'circle',
          attrs: {
            body: { fill: nodeType.color, stroke: nodeType.color },
            label: { text: nodeType.text, fill: '#fff', fontSize: 12 },
          },
          data: { nodeType: nodeType.type, text: nodeType.text },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            },
            items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
          },
        });
      } else if (nodeType.shape === 'diamond') {
        node = graph.addNode({
          x: centerX - 40,
          y: centerY - 40,
          width: 80,
          height: 80,
          shape: 'polygon',
          attrs: {
            body: { fill: nodeType.color, stroke: nodeType.color, refPoints: '0,10 10,0 20,10 10,20' },
            label: { text: nodeType.text, fill: '#fff', fontSize: 12 },
          },
          data: { nodeType: nodeType.type, text: nodeType.text },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            },
            items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
          },
        });
      } else {
        node = graph.addNode({
          x: centerX - 60,
          y: centerY - 25,
          width: 120,
          height: 50,
          shape: 'rect',
          attrs: {
            body: { fill: nodeType.color, stroke: nodeType.color, rx: 6, ry: 6 },
            label: { text: nodeType.text, fill: '#fff', fontSize: 14 },
          },
          data: { nodeType: nodeType.type, text: nodeType.text },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', strokeWidth: 1, fill: '#fff' } } },
            },
            items: [{ group: 'top' }, { group: 'bottom' }, { group: 'left' }, { group: 'right' }],
          },
        });
      }
      message.success(`已添加节点: ${nodeType.text}`);
    } catch (error) {
      console.error('Failed to create node:', error);
      message.error('添加节点失败');
    }
  };

  // 右键菜单操作
  const handleContextMenuAction = (action: string) => {
    const graph = graphRef.current;
    if (!graph) return;

    const { type, target } = contextMenu;

    switch (action) {
      case 'edit':
        if (type === 'node' && target) {
          const data = target.getData() || {};
          setCurrentNode(target);
          nodeForm.setFieldsValue({
            text: target.attr('label/text') || data.text || '',
            role: data.role || 'approver',
            needAdmin: data.needAdmin || false,
            timeout: data.timeout || 24,
            description: data.description || '',
          });
          setDrawerOpen(true);
        }
        break;
      case 'delete':
        if (target) {
          graph.removeCell(target);
          message.success('已删除');
        }
        break;
      case 'copy':
        if (target) {
          graph.copy([target]);
          message.success('已复制');
        }
        break;
      case 'paste':
        if (!graph.isClipboardEmpty()) {
          graph.paste({ offset: 32 });
          message.success('已粘贴');
        }
        break;
      case 'clear':
        graph.clearCells();
        message.success('画布已清空');
        break;
      case 'center':
        graph.centerContent();
        message.success('已居中显示');
        break;
    }

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // 保存节点属性
  const handleNodeSave = () => {
    if (!currentNode) return;

    try {
      const values = nodeForm.getFieldsValue();

      // 更新节点文本
      currentNode.attr('label/text', values.text);

      // 更新节点数据
      currentNode.setData({
        ...currentNode.getData(),
        text: values.text,
        role: values.role,
        needAdmin: values.needAdmin,
        timeout: values.timeout,
        description: values.description,
      });

      message.success('节点属性已更新');
      setDrawerOpen(false);
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 保存整个流程
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const graphData = graphRef.current?.toJSON();
      onSave(values, graphData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 渲染右键菜单
  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;

    const { type, x, y } = contextMenu;
    let menuItems: { key: string; label: string }[] = [];

    if (type === 'node') {
      menuItems = [
        { key: 'edit', label: '编辑' },
        { key: 'copy', label: '复制' },
        { key: 'delete', label: '删除' },
      ];
    } else if (type === 'edge') {
      menuItems = [
        { key: 'delete', label: '删除' },
      ];
    } else {
      menuItems = [
        { key: 'paste', label: '粘贴' },
        { key: 'clear', label: '清空画布' },
        { key: 'center', label: '居中显示' },
      ];
    }

    return (
      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderRadius: 4,
          padding: '4px 0',
          zIndex: 1000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <div
            key={item.key}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 14,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            onClick={() => handleContextMenuAction(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <EditOutlined />
          <span>编辑审批流程</span>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存流程
          </Button>
        </Space>
      }
    >
      {/* 流程信息编辑表单 */}
      <Form form={form} layout="horizontal" labelCol={{ span: 3 }} style={{ marginBottom: 24 }}>
        <Form.Item
          label="流程名称"
          name="name"
          rules={[{ required: true, message: '请输入流程名称' }]}
        >
          <Input placeholder="请输入流程名称" />
        </Form.Item>
        <Form.Item
          label="版本号"
          name="version"
          rules={[{ required: true, message: '请输入版本号' }]}
        >
          <Input placeholder="请输入版本号" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          label="流程说明"
          name="description"
          rules={[{ required: true, message: '请输入流程说明' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入流程说明" />
        </Form.Item>
      </Form>

      {/* 流程图编辑器 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            padding: '12px 16px',
            background: '#f0f2f5',
            borderRadius: 4,
          }}
        >
          <span style={{ fontWeight: 500 }}>流程图编辑器</span>
          <Space>
            <span style={{ fontSize: 12, color: '#666' }}>
              点击左侧节点添加 | 双击节点编辑属性 | 右键查看更多操作 | 从节点连接点拖出可创建连线
            </span>
          </Space>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* 左侧拖拽面板 */}
          <div
            style={{
              width: 150,
              minHeight: 700,
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 12, color: '#333' }}>节点列表</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>点击添加到画布</div>
            {approvalNodeTypes.map((nodeType, index) => (
              <Button
                key={`${nodeType.type}-${index}`}
                block
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 8,
                  height: 'auto',
                  padding: '10px 12px',
                  marginBottom: 8,
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                }}
                onClick={() => {
                  handleClickAdd(nodeType);
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: nodeType.color,
                    borderRadius: nodeType.shape === 'circle' ? '50%' : nodeType.shape === 'diamond' ? 0 : 4,
                    transform: nodeType.shape === 'diamond' ? 'rotate(45deg) scale(0.7)' : 'none',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: '#333' }}>{nodeType.text}</span>
              </Button>
            ))}
          </div>

          {/* 右侧画布 */}
          <div
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              flex: 1,
              height: 700,
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}
          />
        </div>
      </div>

      {/* 操作提示 */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#fafafa',
          borderRadius: 4,
        }}
      >
        <Space size={24} wrap>
          <Space>
            <span style={{ color: '#52C41A', fontWeight: 'bold' }}>●</span>
            <span>开始节点</span>
          </Space>
          <Space>
            <span style={{ color: '#1890FF', fontWeight: 'bold' }}>●</span>
            <span>审批节点</span>
          </Space>
          <Space>
            <span style={{ color: '#FA8C16', fontWeight: 'bold' }}>●</span>
            <span>校验节点</span>
          </Space>
          <Space>
            <span style={{ color: '#FF4D4F', fontWeight: 'bold' }}>●</span>
            <span>结束节点</span>
          </Space>
          <Space>
            <span style={{ color: '#722ED1', fontWeight: 'bold' }}>◆</span>
            <span>条件判断</span>
          </Space>
        </Space>
      </div>

      {/* 右键菜单 */}
      {renderContextMenu()}

      {/* 节点属性编辑 Drawer */}
      <Drawer
        title="节点配置"
        placement="right"
        open={drawerOpen}
        width={400}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleNodeSave}>
              确定
            </Button>
          </Space>
        }
      >
        <Form form={nodeForm} layout="vertical">
          <Form.Item label="节点名称" name="text">
            <Input placeholder="请输入节点名称" />
          </Form.Item>

          <Form.Item label="审批角色" name="role">
            <Select
              placeholder="请选择审批角色"
              options={[
                { value: 'approver', label: '审批员' },
                { value: 'reviewer', label: '复审员' },
                { value: 'admin', label: '管理员' },
                { value: 'system', label: '系统自动' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="需要管理员复审"
            name="needAdmin"
            valuePropName="checked"
            extra="开启后该节点需要管理员进行复审"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="处理时限（小时）"
            name="timeout"
            extra="节点处理的最长时限，超时将发送提醒"
          >
            <Input type="number" placeholder="24" />
          </Form.Item>

          <Form.Item label="节点说明" name="description">
            <Input.TextArea
              rows={4}
              placeholder="请输入节点的详细说明、处理要求等"
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 点击空白处关闭右键菜单 */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </Card>
  );
};

export default WorkflowEditor;
