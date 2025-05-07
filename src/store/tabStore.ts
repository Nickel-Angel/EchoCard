/**
 * 标签页状态管理
 * 用于在不同组件间共享和控制App组件中的标签页选择状态
 */

import { create } from 'zustand';

interface TabState {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

/**
 * 创建标签页状态存储
 * 提供全局访问和修改当前活动标签页的功能
 */
export const useTabStore = create<TabState>((set) => ({
  activeTab: 0, // 默认选中第一个标签页（卡组记忆）
  setActiveTab: (tab: number) => set({ activeTab: tab }),
}));