# 点点速豹 · 舆情速报系统

这是一个 React + Vite 前端项目，已包含 GitLab Pages 发布配置。

## 本地运行

需要 Node.js 20+。

```bash
corepack enable
pnpm install
pnpm run dev
```

默认访问地址为 `http://localhost:3000/`。

## 打包构建

```bash
pnpm run build
```

构建产物会输出到 `dist/`。

## GitLab Pages 发布

项目根目录已包含 `.gitlab-ci.yml`。把本项目源码推送到 GitLab 仓库默认分支后，GitLab CI 会自动执行：

```bash
pnpm install --frozen-lockfile
pnpm run build
cp -r dist/* public/
```

构建成功后，GitLab Pages 会发布 `public/` 目录。

## 说明

- 不需要提交 `node_modules/`、`dist/`、`.vite-cache/`。
- `pnpm-lock.yaml` 需要提交，用于 GitLab CI 固定依赖版本。
- Vite 已配置 `base: './'`，适配 GitLab Pages 子路径部署。
