// 壳组件
export { default as OmnibarListPage } from './OmnibarListPage';
export { default as OmnibarDetailPage } from './OmnibarDetailPage';

// hooks
export { useDetail } from './useDetail';
export type { UseDetailResult } from './useDetail';

// 子部件(允许业务页直接组合使用,跳过壳组件)
export { default as QueryPanel } from './parts/QueryPanel';
export { default as ListContainer } from './parts/ListContainer';
export { default as ListFooter } from './parts/ListFooter';
export { default as DetailHeader } from './parts/DetailHeader';
export { default as DetailSections } from './parts/DetailSections';
export { default as DetailTabs } from './parts/DetailTabs';
export { default as DetailFooter } from './parts/DetailFooter';
export { default as ToolbarActions } from './parts/ToolbarActions';

// 类型
export type {
  ToolbarAction,
  FilterConfig,
  DetailField,
  DetailSection,
  DetailTabItem,
  StatusBadge,
} from './types';

export type { OmnibarListPageProps } from './OmnibarListPage';
export type { OmnibarDetailPageProps } from './OmnibarDetailPage';
