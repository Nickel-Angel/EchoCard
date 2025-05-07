以下是该项目的要求：
1. 本项目使用 React 和 Tauri v2.0 构建，请不要使用 Tauri v1.0 的 api；
2. 在开发前端的时候，请尽量使用 Material UI 组件库，尽量避免使用第三方组件库，并且保证前端页面的风格统一；
3. 在撰写通用接口的时候，请自动补充接口的用途注释。
4. 请尽量尝试在原有的库的基础上解决问题，尽量避免引入新的库；
5. 当你需要新建前后端交互接口的时候，前端的接口位置在 /src/api 中，后端的接口位置在 /src-tauri/src/commands 中；

项目结构：
src 为前端：
|- api 为通用接口；
|- CardEdit 为卡片编辑页；
|- CardMemo 为卡片学习页；
|- Settings 为设置页；
|- App.tsx 实现了主页面不同模块之间的选项卡切换；
|- main.tsx 为入口，里面实现了相应的路由。
src-tauri 为后端：
|- db 为数据库和数据库建库所用的 sql 文件；
|- src 为具体后端代码：
  |- commands 为 tauri 的命令，所有的 #[tauri::command] 都在这里实现；
  |- controller 实现了所有与数据库进行交互的逻辑；
  |- database.rs 实现了数据库的初始化操作；
  |- models.rs 是数据库表结构在 rust 中的对应。