# 速报系统-v8审核上报H5

## 本地运行

**Prerequisites:** Node.js

1. 安装依赖：`npm install`
2. 启动开发服务：`npm run dev`

## GitLab Pages 发布

项目已包含 `.gitlab-ci.yml`，提交到 GitLab 默认分支后会自动构建并发布 Pages。

1. 推送代码到 GitLab
2. 在 GitLab 项目里启用 Pages / CI
3. 等待流水线完成后访问 Pages 地址

构建产物会输出到 `public/`，页面资源使用相对路径，适合直接发布到 GitLab Pages。
