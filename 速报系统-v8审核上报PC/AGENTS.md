# 项目开发约定与用户偏好 (AGENTS.md)

为了确保后续所有开发与修改均符合您的特定偏好与规范，特记录以下规则，系统在后续所有对话与迭代中将自动遵循：

## 1. 页面定位与状态记忆 (记住当前修改页面)
- 路由模式统一使用 **Hash 模式**（如 `#/home`、`#/report-summary`、`#/business-config?module=...` 等），配合 Vite 配置 `base: './'`，便于任何子路径、静态目录及 Nginx 零配置部署（无需 history 回退配置 `try_files`）。
- 页面切换统一使用 `handleNavigate` 进行状态同步与持久化，实时更新 URL Hash 并写入 `localStorage.setItem('ddsb_active_page', page)`。
- 初始化页面状态优先读取 URL Hash 或 `localStorage` 保存的值，并监听 `hashchange` 事件，确保浏览器前进/后退、直接输入 URL、代码热重载或重启预览时均能准确定位到当前页面。

---
*注：此文件由 AI 自动读取与遵循，如需调整或添加新规则，可随时更新本文件。*
