import { useEffect, useRef, useState } from 'react';

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

export default function MessageList({ messages, pending }) {
  const bottomRef = useRef(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pending]);

  useEffect(() => {
    if (!copiedKey) return undefined;
    const timer = setTimeout(() => setCopiedKey(null), 1500);
    return () => clearTimeout(timer);
  }, [copiedKey]);

  async function handleCopy(key, text) {
    await copyToClipboard(text);
    setCopiedKey(key);
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const key = `${message.role}-${index}`;
        const time = formatTime(message.createdAt);
        return (
          <article
            key={key}
            className={`message message-${message.role}`}
          >
            <div className="message-body">
              <div className="message-bubble">{message.content}</div>
              {message.role === 'user' && (
                <div className="message-tools">
                  {time && <time className="message-time">{time}</time>}
                  <button
                    type="button"
                    className="message-copy"
                    aria-label="复制消息"
                    title={copiedKey === key ? '已复制' : '复制'}
                    onClick={() => handleCopy(key, message.content)}
                  >
                    {copiedKey === key ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}

      {pending && (
        <article className="message message-assistant">
          <div className="message-body">
            <div className="message-bubble typing" aria-label="AI 正在生成回复">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="typing-text">正在生成回复…</span>
            </div>
          </div>
        </article>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5.5A2.5 2.5 0 0012.5 3H6a2 2 0 00-2 2v7.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
