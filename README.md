# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## 项目结构

### 前端目录结构 (`/src`)

```
src/
├── App.tsx                # 主应用组件，实现不同模块之间的选项卡切换
├── CardEdit/              # 卡片编辑页模块
│   ├── CardAdd.tsx        # 添加卡片组件
│   ├── CardEditHeader.tsx # 卡片编辑页头部组件
│   ├── CardEditMain.tsx   # 卡片编辑页主要组件
│   └── TemplateAdd.tsx    # 添加模板组件
├── CardMemo/              # 卡片学习页模块
│   ├── CardMemoEnd.tsx    # 学习结束页面
│   ├── CardMemoLearning.tsx # 卡片学习组件
│   ├── CardMemoMain.tsx   # 卡片学习主页面
│   ├── CardMemoStart.tsx  # 学习开始页面
│   ├── CardMemoStatistic.tsx # 学习统计组件
│   ├── StatisticUtils.tsx # 统计工具函数
│   └── templates/         # 模板相关组件
├── Settings/              # 设置页模块
│   └── SettingsMain.tsx   # 设置主页面
├── api/                   # 通用接口
│   ├── Card.tsx           # 卡片相关接口
│   ├── Deck.tsx           # 牌组相关接口
│   ├── Settings.tsx       # 设置相关接口
│   └── Template.tsx       # 模板相关接口
├── assets/                # 静态资源
├── main.css               # 主样式文件
├── main.tsx               # 入口文件，实现路由
├── store/                 # 状态管理
│   └── tabStore.ts        # 选项卡状态管理
└── utils/                 # 工具函数
    └── windowManager.ts   # 窗口管理工具
```

### 后端目录结构 (`/src-tauri/src`)

```
src-tauri/src/
├── commands/              # Tauri 命令模块
│   ├── cardedit.rs        # 卡片编辑相关命令
│   ├── cardmemo.rs        # 卡片学习相关命令
│   └── settings.rs        # 设置相关命令
├── commands.rs            # 命令模块导出
├── controller/            # 控制器模块
│   ├── card_controller.rs # 卡片控制器
│   ├── deck_controller.rs # 牌组控制器
│   ├── review_controller.rs # 复习控制器
│   └── template_controller.rs # 模板控制器
├── controller.rs          # 控制器模块导出
├── database.rs            # 数据库初始化操作
├── lib.rs                 # 库入口
├── main.rs                # 主程序入口
└── models.rs              # 数据库表结构对应的 Rust 模型
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## sqlx check

Before trying to build, run `cargo sqlx prepare -D sqlite://db/echocard.db` in the terminal.

---
TODO:
- impl: using csv to add cards
- impl: settings(FSRS parameters, set retention)
- impl: UI optimization