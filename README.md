# Local AI Chat

一个完全运行在本地的 AI 聊天 Web 应用：React + Vite 前端，Node.js + Express 后端，回答由本地 Ollama 的 `qwen3.5:4b` 模型生成，不调用任何云端大模型 API。

## 功能

- 多轮连续对话，自动保留上下文
- 用户 / AI 消息区分展示
- Enter 发送、Shift + Enter 换行
- AI 生成中显示加载动画
- 一键清空当前对话、随时开启新对话
- 历史对话侧边栏（保存在浏览器 localStorage）
- 显示当前模型名称与 Ollama 连接状态
- Ollama 未启动或模型未下载时给出明确错误提示和重试入口
- 响应式布局，适配桌面与移动端
- 第一版使用非流式响应

## 项目结构

```
.
├── backend/                 # Express 服务，负责转发请求到 Ollama
│   ├── package.json
│   └── server.js
├── frontend/                # React + Vite 聊天界面
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # /api 代理到 http://localhost:3001
│   └── src/
│       ├── App.jsx          # 会话状态、发送逻辑、错误处理
│       ├── main.jsx
│       ├── styles.css       # 全部样式
│       └── components/
│           ├── Sidebar.jsx
│           ├── MessageList.jsx
│           └── Composer.jsx
└── README.md
```

前端不会直接访问 Ollama，所有请求都经过后端 `backend/server.js` 转发。

## 环境要求

- Node.js 18 及以上（推荐 20+）
- [Ollama](https://ollama.com/download) 已安装

检查环境：

```bash
node -v
npm -v
ollama --version
```

## 一、准备 Ollama 与模型

1. 启动 Ollama 服务（macOS / Windows 安装后通常会自动启动，也可手动执行）：

```bash
ollama serve
```

2. 另开一个终端，下载模型：

```bash
ollama pull qwen3.5:4b
```

3. 确认模型已安装、服务可访问：

```bash
ollama list
curl http://localhost:11434/api/tags
```

## 二、安装依赖

在项目根目录分别安装前后端依赖：

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 三、启动项目

需要两个终端，先启动后端，再启动前端。

终端 1（后端，端口 3001）：

```bash
cd backend
npm run dev
```

终端 2（前端，默认端口 5173）：

```bash
cd frontend
npm run dev
```

打开终端中提示的地址，默认是 <http://localhost:5173>。如果 5173 被占用，Vite 会自动切换到 5174 等端口，以终端输出为准。

后端启动成功时会输出：

```
Backend running at http://localhost:3001
Ollama: http://localhost:11434 | Model: qwen3.5:4b
```

生产模式构建前端：

```bash
cd frontend
npm run build
npm run preview
```

## 四、配置项（可选）

后端支持通过环境变量覆盖默认配置：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 后端监听端口 |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama 服务地址 |
| `OLLAMA_MODEL` | `qwen3.5:4b` | 使用的模型名称 |

例如：

```bash
PORT=3002 OLLAMA_MODEL=qwen3.5:4b npm run dev
```

## 后端接口

### GET /api/health

检查 Ollama 是否在线、目标模型是否已安装。

```json
{
  "ok": true,
  "model": "qwen3.5:4b",
  "modelReady": true,
  "installedModels": ["qwen3.5:4b"]
}
```

Ollama 未启动时返回 `503` 与可读错误信息。

### POST /api/chat

非流式对话接口，请求体中的 `messages` 为完整多轮上下文：

```json
{
  "messages": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！有什么可以帮你？" },
    { "role": "user", "content": "介绍一下你自己" }
  ]
}
```

成功响应：

```json
{
  "reply": "我是一个运行在本地的 AI 助手……",
  "model": "qwen3.5:4b",
  "totalDuration": 123456789,
  "evalCount": 128
}
```

错误状态码：

- `400`：请求参数不合法
- `404`：本地未安装指定模型
- `503`：Ollama 未启动 / 无法连接
- `504`：模型响应超时

## 测试清单

按以下步骤可验证第一版完整链路：

1. 启动 Ollama、后端、前端，打开页面。
2. 初始页显示居中的欢迎语和输入框，左侧显示“Ollama 已连接”。
3. 输入“你好”并按 Enter：出现用户气泡、AI 加载动画，随后显示回复。
4. 继续追问“我刚才问了什么？”：AI 能结合上文回答，说明多轮上下文生效。
5. 点击顶部「清空对话」并确认：消息被清空，回到欢迎页。
6. 点击左侧「新对话」后再发消息：生成新的历史会话，旧会话仍保留在侧边栏。
7. 停止 Ollama（在运行 `ollama serve` 的终端按 Ctrl+C），再发送消息：展示“无法连接到 Ollama”的明确提示，并提供「重试 / 重新检测」。
8. 缩小浏览器窗口至移动端宽度：侧边栏收起为抽屉，可通过左上角菜单按钮打开。

## 常见问题

**页面顶部/底部提示 Ollama 未连接**

确认 `ollama serve` 正在运行，且 <http://localhost:11434> 可访问，然后点击侧边栏底部的状态行或错误提示中的「重新检测」。

**提示本地尚未安装模型**

执行 `ollama pull qwen3.5:4b`，下载完成后刷新页面。

**端口被占用**

后端可通过 `PORT=3002 npm run dev` 更换端口，同时把 `frontend/vite.config.js` 中代理的 `target` 改成对应地址；前端端口由 Vite 自动处理。

**首次回复很慢**

首次加载模型需要时间，之后会明显变快。非流式模式下需要等完整回答生成完毕后一次性显示。

后端默认向 Ollama 传入 `think: false`。`qwen3.5` 默认会先输出一段思考过程，而本地 CPU 推理较慢且思考内容不会体现在回答里，关闭后可以更快看到正文。如需开启思考，可修改 `backend/server.js` 中的 `think` 字段。
