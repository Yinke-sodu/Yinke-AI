import express from 'express';
import cors from 'cors';

const PORT = Number(process.env.PORT) || 3001;
const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'http://localhost:11434').replace(/\/$/, '');
const MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:4b';
const REQUEST_TIMEOUT = 300000;

const SYSTEM_PROMPT =
  '你是一个友善、专业的 AI 助手。请使用简体中文回答，回答清晰、有条理，必要时使用列表说明。';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

async function ollamaFetch(path, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${OLLAMA_HOST}${path}`, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeModelName(name = '') {
  return name.replace(/:latest$/, '');
}

function unavailableMessage() {
  return `无法连接到 Ollama（${OLLAMA_HOST}）。请确认 Ollama 已启动，可在终端运行 "ollama serve" 后重试。`;
}

// 健康检查：Ollama 是否在线、模型是否已下载
app.get('/api/health', async (req, res) => {
  try {
    const response = await ollamaFetch('/api/tags');
    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }
    const data = await response.json();
    const models = (data.models || []).map((item) => normalizeModelName(item.name));
    res.json({
      ok: true,
      model: MODEL,
      modelReady: models.includes(normalizeModelName(MODEL)),
      installedModels: models,
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      model: MODEL,
      modelReady: false,
      error: unavailableMessage(),
    });
  }
});

// 非流式对话接口
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: '请求缺少有效的 messages 数组。' });
  }

  const cleaned = [];
  for (const message of messages) {
    if (
      !message ||
      !['user', 'assistant'].includes(message.role) ||
      typeof message.content !== 'string' ||
      !message.content.trim()
    ) {
      return res.status(400).json({ error: 'messages 中存在无效的消息格式。' });
    }
    cleaned.push({ role: message.role, content: message.content.trim() });
  }

  const payload = {
    model: MODEL,
    stream: false,
    // qwen3.5 默认会先输出思考过程，本地 CPU 推理较慢，第一版关闭思考以更快返回正文
    think: false,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...cleaned],
    options: { temperature: 0.7 },
  };

  try {
    const response = await ollamaFetch(
      '/api/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      REQUEST_TIMEOUT,
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data?.error || `Ollama 返回状态码 ${response.status}`;
      const isMissingModel = /not found|pull/i.test(detail);
      return res.status(isMissingModel ? 404 : 502).json({
        error: isMissingModel
          ? `本地尚未安装模型 ${MODEL}，请先运行 "ollama pull ${MODEL}"。`
          : `Ollama 调用失败：${detail}`,
      });
    }

    const reply = data?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Ollama 返回了空内容，请稍后重试。' });
    }

    res.json({
      reply,
      model: data.model || MODEL,
      totalDuration: data.total_duration ?? null,
      evalCount: data.eval_count ?? null,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: '模型响应超时，请稍后重试。' });
    }
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return res.status(503).json({ error: unavailableMessage() });
    }
    console.error('[chat error]', error);
    res.status(500).json({ error: '服务器内部错误，请查看后端日志。' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在。' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Ollama: ${OLLAMA_HOST} | Model: ${MODEL}`);
});
