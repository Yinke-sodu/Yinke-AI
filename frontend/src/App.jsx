import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import Composer from './components/Composer';
import ConfirmDialog from './components/ConfirmDialog';
import AssistantPage, { ASSISTANTS } from './components/AssistantPage';

const STORAGE_KEY = 'local-ai-chat:conversations';
const DEFAULT_MODEL = 'qwen3.5:4b';
const ASSISTANT_SUGGESTIONS = [
  '我的 NAS 磁盘还剩多少空间？',
  '帮我看看现在有哪些 Docker 容器在运行。',
  '帮我在文件里搜一下文件名包含「发票」的文档。',
];

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function createConversation() {
  return {
    id: createId(),
    title: '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        Array.isArray(item.messages) &&
        item.messages.every(
          (message) =>
            message &&
            ['user', 'assistant'].includes(message.role) &&
            typeof message.content === 'string',
        ),
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState('chat');
  const [draftAssistant, setDraftAssistant] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [health, setHealth] = useState({ status: 'checking', model: DEFAULT_MODEL, modelReady: true });
  const lastFailedMessage = useRef('');
  const abortRef = useRef(null);

  const activeConversation = conversations.find((item) => item.id === activeId) || null;
  const messages = activeConversation?.messages ?? [];
  const emptyAssistant = activeConversation?.assistant || draftAssistant;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  async function checkHealth() {
    setHealth((prev) => ({ ...prev, status: 'checking' }));
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ollama 未连接');
      setHealth({
        status: 'online',
        model: data.model || DEFAULT_MODEL,
        modelReady: Boolean(data.modelReady),
        installedModels: data.installedModels || [],
      });
    } catch (err) {
      setHealth({
        status: 'offline',
        model: DEFAULT_MODEL,
        modelReady: false,
        detail: err.message,
      });
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  function updateConversation(id, updater) {
    setConversations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...updater(item), updatedAt: Date.now() } : item,
      ),
    );
  }

  async function requestReply(conversationId, requestMessages) {
    setPending(true);
    setError('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: requestMessages.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || '请求失败，请稍后重试。');
      }

      updateConversation(conversationId, (item) => ({
        ...item,
        messages: [
          ...item.messages,
          { role: 'assistant', content: data.reply, createdAt: Date.now() },
        ],
      }));
      setHealth((prev) =>
        prev.status === 'online' ? prev : { ...prev, status: 'online', modelReady: true },
      );
    } catch (err) {
      // 用户主动停止生成时不提示错误
      if (err.name === 'AbortError') return;
      const message =
        err instanceof TypeError
          ? '无法连接到后端服务（http://localhost:3001），请确认后端已启动。'
          : err.message;
      setError(message);
      checkHealth();
    } finally {
      abortRef.current = null;
      setPending(false);
    }
  }

  function stopReply() {
    abortRef.current?.abort();
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || pending) return;

    setError('');
    lastFailedMessage.current = text;

    let conversationId = activeId;
    let baseMessages = messages;

    if (!conversationId) {
      const conversation = { ...createConversation(), assistant: draftAssistant || undefined };
      conversationId = conversation.id;
      baseMessages = [];
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversationId);
    }

    const userMessage = { role: 'user', content: text, createdAt: Date.now() };
    const nextMessages = [...baseMessages, userMessage];

    updateConversation(conversationId, (item) => ({
      ...item,
      title:
        item.messages.length === 0
          ? text.replace(/\s+/g, ' ').slice(0, 22) || '新对话'
          : item.title,
      messages: nextMessages,
    }));

    await requestReply(conversationId, nextMessages);
  }

  function handleNewChat() {
    setActiveId(null);
    setDraftAssistant(null);
    setPage('chat');
    setError('');
    setSidebarOpen(false);
  }

  function handleSelectConversation(id) {
    setActiveId(id);
    setDraftAssistant(null);
    setPage('chat');
    setError('');
    setSidebarOpen(false);
  }

  function handleOpenAssistantChat(assistant) {
    setActiveId(null);
    setDraftAssistant(assistant);
    setPage('chat');
    setError('');
    setSidebarOpen(false);
  }

  function requestDeleteConversation(id) {
    setDeleteTarget(conversations.find((item) => item.id === id) || null);
  }

  function confirmDeleteConversation() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setConversations((prev) => prev.filter((item) => item.id !== id));
    if (id === activeId) {
      setActiveId(null);
      setError('');
    }
    setDeleteTarget(null);
  }

  function handleRetry() {
    if (pending) return;
    const lastMessage = messages[messages.length - 1];
    if (activeConversation && lastMessage?.role === 'user') {
      requestReply(activeConversation.id, messages);
      return;
    }
    if (lastFailedMessage.current) sendMessage(lastFailedMessage.current);
  }

  const isEmpty = messages.length === 0;
  const healthClass =
    health.status === 'online' && health.modelReady
      ? 'status-ok'
      : health.status === 'checking'
        ? 'status-checking'
        : 'status-error';

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
        onDelete={requestDeleteConversation}
        onOpenAssistant={() => {
          setPage('assistant');
          setSidebarOpen(false);
        }}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="关闭侧边栏"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="确定删除对话?"
          description="删除后，聊天记录将不可恢复。"
          confirmText="删除"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteConversation}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-button menu-button"
            aria-label="打开侧边栏"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          {page === 'chat' && activeConversation && (
            <span className="topbar-title" title={activeConversation.title}>
              {activeConversation.title}
            </span>
          )}

          <div className="topbar-spacer" />

          <div className="topbar-actions">
            <button
              type="button"
              className="health-pill"
              onClick={checkHealth}
              title="点击重新检测 Ollama 连接"
              aria-label="重新检测 Ollama 连接"
            >
              <span className={`status-dot ${healthClass}`} />
            </button>

            <button type="button" className="icon-button bell-button" aria-label="通知">
              <BellIcon />
            </button>
          </div>
        </header>

        {page === 'assistant' ? (
          <AssistantPage onOpen={handleOpenAssistantChat} />
        ) : (
          <>
            <div className="chat-scroll">
          {isEmpty ? (
            emptyAssistant ? (
              <section className="assistant-hello">
                <div className="assistant-hello-inner">
                  <div className="assistant-hello-head">
                    <div
                      className="assistant-hello-avatar"
                      style={{ background: emptyAssistant.iconBg }}
                    >
                      <img src={emptyAssistant.icon} alt="" />
                    </div>
                    <div className="assistant-hello-text">
                      <span className="welcome-eyebrow">你好, 我是GEAK AI</span>
                      <h1 className="welcome-title">我能帮你做什么</h1>
                    </div>
                  </div>

                  <div className="welcome-composer">
                    {error && (
                      <ErrorBanner
                        error={error}
                        pending={pending}
                        onRetry={handleRetry}
                        onCheck={checkHealth}
                      />
                    )}
                    <Composer
                      variant="welcome"
                      pending={pending}
                      onSend={sendMessage}
                      onStop={stopReply}
                      placeholder="有问题尽管问"
                    />
                  </div>

                  <section className="assistant-recommend">
                    <span className="assistant-recommend-label">为你推荐</span>
                    <div className="assistant-recommend-list">
                      {ASSISTANT_SUGGESTIONS.map((question) => (
                        <button
                          key={question}
                          type="button"
                          className="assistant-recommend-chip"
                          onClick={() => sendMessage(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </section>
            ) : (
            <section className="welcome">
              <div className="welcome-inner">
                <div className="welcome-head">
                  <img className="welcome-logo" src="/assets/logo-large.png" alt="GEAK AI" />
                  <div className="welcome-heading">
                    <span className="welcome-eyebrow">你好, 我是GEAK AI</span>
                    <h1 className="welcome-title">我能帮你做什么</h1>
                  </div>
                </div>

                <div className="welcome-composer">
                  {error && (
                    <ErrorBanner
                      error={error}
                      pending={pending}
                      onRetry={handleRetry}
                      onCheck={checkHealth}
                    />
                  )}
                  <Composer
                    variant="welcome"
                    pending={pending}
                    onSend={sendMessage}
                    onStop={stopReply}
                    placeholder="有问题尽管问"
                  />
                </div>

                <section className="explore">
                  <div className="explore-head">
                    <h2 className="explore-title">NAS管家</h2>
                    <button
                      type="button"
                      className="explore-more"
                      onClick={() => {
                        setPage('assistant');
                        setDraftAssistant(null);
                      }}
                    >
                      <span>探索更多</span>
                      <ChevronRightIcon />
                    </button>
                  </div>
                  <div className="assistant-grid">
                    {ASSISTANTS.slice(0, 4).map((item) => (
                      <button
                        type="button"
                        className="assistant-card"
                        key={item.key}
                        onClick={() => handleOpenAssistantChat(item)}
                      >
                        <span
                          className="assistant-card-icon"
                          style={{ background: item.iconBg }}
                        >
                          <img src={item.icon} alt="" />
                        </span>
                        <span className="assistant-card-body">
                          <span className="assistant-card-title">{item.title}</span>
                          <span className="assistant-card-desc">{item.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </section>
            )
          ) : (
            <div className="chat-container">
              <MessageList messages={messages} pending={pending} />
            </div>
          )}
        </div>

        {!isEmpty && (
          <div className="composer-dock">
            <div className="composer-dock-inner">
              {error && (
                <ErrorBanner
                  error={error}
                  pending={pending}
                  onRetry={handleRetry}
                  onCheck={checkHealth}
                />
              )}
              <Composer
                pending={pending}
                onSend={sendMessage}
                onStop={stopReply}
                placeholder="有问题尽管问"
              />
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}

function ErrorBanner({ error, pending, onRetry, onCheck }) {
  return (
    <div className="error-banner" role="alert">
      <AlertIcon />
      <div className="error-content">
        <p className="error-text">{error}</p>
        <div className="error-actions">
          <button type="button" onClick={onRetry} disabled={pending}>
            重试
          </button>
          <button type="button" onClick={onCheck}>
            重新检测
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 9a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10.5 19a1.8 1.8 0 003 0" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5M12 16h.01" />
    </svg>
  );
}
