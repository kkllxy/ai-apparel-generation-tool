# AI 模特成片生成器

面向独立服装设计师的 AI 模特穿搭成片生成工具。上传模特参考图 + 服装搭配参考图，一键生成电商级模特穿搭成片，并支持姿势、配色、换搭迭代编辑。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkkllxy%2Fai-apparel-generation-tool&env=BANANA_API_KEY,SUPABASE_URL,SUPABASE_ANON_KEY&envDescription=API%20Keys%20needed%20for%20the%20app&envLink=https%3A%2F%2Fgithub.com%2Fkkllxy%2Fai-apparel-generation-tool%2Fblob%2Fmain%2FDEPLOY.md&project-name=ai-apparel-generation-tool)

## ✨ 功能特性

- 📷 模特参考图 + 搭配参考图上传
- 🎨 AI 一键生成模特穿搭成片（300×400）
- 🧍 姿势调整（站姿/走姿/坐姿/侧身/抬手）
- 🎨 配色方案切换（黑白/米白+深蓝/浅卡其+白/深灰+酒红）
- 👗 换搭方案（上传新搭配图重新生成）
- 📥 一键下载成片
- 📜 历史记录管理

## 🛠️ 技术栈

- **前端**: Vite + React
- **后端**: Express（本地开发）/ Vercel Serverless Functions（生产）
- **数据存储**: Supabase（PostgreSQL + Storage）
- **图像生成**: Banana Light API（jiekou.ai）

## 🚀 部署指南

详见 [DEPLOY.md](./DEPLOY.md)

## 💻 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 Key

# 启动后端
npm run server

# 启动前端（另一个终端）
npm run dev
```

## 📄 License

MIT
