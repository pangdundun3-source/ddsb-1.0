# 项目分层说明

本项目采用适合 React 前端的 **MVVM 分层**。React 组件天然承担 View 职责，因此没有强行照搬传统 MVC 或 MVP 的 Controller / Presenter 类结构。

## 分层职责

### View

目录：

- `src/pages`
- `src/components`
- `src/App.tsx`

职责：

- 展示页面和组件
- 接收 ViewModel 提供的数据
- 触发用户操作回调
- 不直接编排审核、转办、重提等业务规则

`src/App.tsx` 现在只负责页面布局、页面分发和 ViewModel 数据绑定。

### ViewModel

目录：

- `src/viewmodels/useAppViewModel.ts`

职责：

- 管理页面状态
- 管理当前选中记录
- 管理导航、弹窗和提示消息
- 将用户操作转换为业务服务调用
- 为 View 提供稳定、易消费的数据和事件方法

### Service / Domain

目录：

- `src/services/reportWorkflowService.ts`
- `src/auditStage.ts`

职责：

- 封装报送创建、重提、审核通过、驳回、转办等业务规则
- 生成审核时间线、审核记录和操作日志
- 统一处理“只有终审可以评分”的规则
- 保证页面组件不重复实现相同的业务逻辑

### Model / Data

目录：

- `src/types.ts`
- `src/data/mockData.ts`

职责：

- 定义领域数据结构和类型
- 提供本地实验数据
- 后续接入 API 时，可替换数据来源而不影响页面组件

## 后续接入接口的建议

当项目接入真实后端时，可以在 `src/services` 下继续拆分：

- `reportApi.ts`：报送接口
- `auditApi.ts`：审核接口
- `organizationApi.ts`：机构接口
- `logApi.ts`：日志接口

ViewModel 只依赖这些服务，不直接使用 `fetch` 或具体接口地址。
