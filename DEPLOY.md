# Vercel 部署指南

## 前置条件

1. 一个 [Vercel](https://vercel.com) 账号
2. 一个 [Supabase](https://supabase.com) 项目
3. 一个 [jiekou.ai](https://jiekou.ai) API Key（Banana Light 模型）

---

## 第一步：配置 Supabase

### 1.1 创建 Supabase 项目

前往 [supabase.com/dashboard](https://supabase.com/dashboard)，创建一个新项目。记下以下信息：

- **Project URL** — 类似 `https://xxxxx.supabase.co`
- **anon public key** — 在 Settings → API 页面

### 1.2 创建数据表

在 Supabase Dashboard 的 **SQL Editor** 中执行以下 SQL：

```sql
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_ref_url TEXT,
  outfit_ref_url TEXT,
  prompt TEXT,
  result_url TEXT,
  pose TEXT,
  color_scheme TEXT,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON generations
  FOR ALL USING (true) WITH CHECK (true);
```

### 1.3 创建 Storage Bucket

1. 进入 Supabase Dashboard → **Storage**
2. 点击 **New bucket**
3. 名称填 `images`
4. 勾选 **Public bucket**（公开访问）
5. 点击 **Create bucket**

### 1.4 配置 Storage 权限

在 **SQL Editor** 中执行：

```sql
CREATE POLICY "Allow public uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Allow public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images');

CREATE POLICY "Allow public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images');
```

---

## 第二步：获取 Banana API Key

1. 前往 [jiekou.ai](https://jiekou.ai) 注册账号
2. 在控制台获取 API Key（以 `sk_` 开头）
3. 确保你的 Key 可以访问 **Nano Banana Light** 模型（包含 T2I 和 I2I）

---

## 第三步：部署到 Vercel

### 方式一：通过 GitHub 导入（推荐）

1. Fork 或导入本仓库到你的 GitHub 账号
2. 前往 [vercel.com/new](https://vercel.com/new)
3. 点击 **Import** 选择你 fork 的仓库
4. 在 **Environment Variables** 中添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `BANANA_API_KEY` | `sk_xxx...` | jiekou.ai 的 API Key |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | `eyJhbG...` | Supabase service role key（可选，留空则用 anon key） |

5. 点击 **Deploy**
6. 等待构建完成，访问分配的域名即可使用

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录
vercel

# 按提示配置项目
# 设置环境变量
vercel env add BANANA_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# 部署到生产
vercel --prod
```

---

## 第四步：验证部署

1. 访问你的 Vercel 域名（如 `https://your-project.vercel.app`）
2. 页面应显示三栏布局的深色主题界面
3. 上传一张模特参考图和搭配参考图
4. 点击「生成成片」测试 AI 生成功能
5. 如生成成功，表示所有服务连接正常 ✅

---

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `BANANA_API_KEY` | ✅ | jiekou.ai Banana Light API 密钥 |
| `SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase 匿名公钥 |
| `SUPABASE_SERVICE_KEY` | ❌ | Supabase Service Role Key（可选，权限更高） |

> **注意**: 用户也可以在应用界面的设置面板中输入自己的 API Key，该 Key 存储在浏览器 localStorage 中，优先级高于环境变量。

---

## 项目结构

```
├── api/                  # Vercel Serverless Functions
│   ├── generate.js       # AI 生成代理（Banana API）
│   ├── history.js        # 生成历史查询
│   └── upload.js         # 图片上传（Supabase Storage）
├── server/               # 本地开发用 Express 服务
│   └── index.js
├── src/                  # React 前端
│   ├── components/       # UI 组件
│   ├── lib/              # 工具库（API 客户端、Prompt 构造）
│   ├── App.jsx
│   └── index.css
├── supabase/migrations/  # 数据库迁移
├── vercel.json           # Vercel 部署配置
└── .env.example          # 环境变量模板
```

---

## 常见问题

### 上传失败 / "new row violates row-level security policy"
确保已执行第 1.4 步的 Storage 权限 SQL。

### 生成失败 / 400 错误
检查 `BANANA_API_KEY` 是否正确填写，且 Key 有足够余额。

### 图片无法显示
确保 Supabase Storage bucket `images` 设置为公开（Public）。

### 本地开发
本地开发时，Express 后端（`npm run server`）和 Vite 前端（`npm run dev`）需要分别启动。部署到 Vercel 时，`api/` 目录下的 Serverless Functions 会自动替代 Express 后端。
