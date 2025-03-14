import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

/**
 * 打开CardMemoStart窗口
 * @param deckData 牌组数据
 */
export function openCardMemoStartWindow(deckData: {
  name: string;
  tolearn: number;
  learning: number;
  toreview: number;
}) {
  // 创建一个唯一的标识符
  const windowLabel = `card-memo-learning-${Date.now()}`;
  
  // 将数据序列化为URL参数
  const queryParams = new URLSearchParams();
  queryParams.append('deckName', deckData.name);
  queryParams.append('tolearn', deckData.tolearn.toString());
  queryParams.append('learning', deckData.learning.toString());
  queryParams.append('toreview', deckData.toreview.toString());
  
  // 创建新窗口
  const webview = new WebviewWindow(windowLabel, {
    url: `/card-memo-learning?${queryParams.toString()}`,
    title: `学习牌组: ${deckData.name}`,
    width: 650,
    height: 700,
    center: true,
  });
  
  // 监听窗口事件
  webview.once('tauri://created', () => {
    console.log('CardMemoStart窗口已创建');
  });
  
  webview.once('tauri://error', (e) => {
    console.error('创建CardMemoStart窗口时出错:', e);
  });
}