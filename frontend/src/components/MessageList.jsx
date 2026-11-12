import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

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

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MarkdownText({ text }) {
  const blocks = [];
  let list = null;
  let paragraph = [];

  function flushList() {
    if (list) {
      blocks.push({ type: 'list', items: list });
      list = null;
    }
  }

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', lines: paragraph });
      paragraph = [];
    }
  }

  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      return;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'divider' });
      return;
    }

    const listItem = trimmed.match(/^[-*+]\s+(.*)$/);
    if (listItem) {
      flushParagraph();
      if (!list) list = [];
      list.push(listItem[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return (
    <div className="markdown">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Tag = ['h2', 'h3', 'h4', 'h5', 'h6'][Math.min(block.level - 1, 4)];
          return (
            <Tag key={index}>
              <InlineText text={block.text} />
            </Tag>
          );
        }
        if (block.type === 'divider') return <hr key={index} />;
        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                <InlineText text={line} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
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
              <div className="message-bubble">
                {message.role === 'assistant' ? (
                  <MarkdownText text={message.content} />
                ) : (
                  message.content
                )}
              </div>
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
            </div>
          </div>
        </article>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function CopyIcon() {
  return <Copy size={14} strokeWidth={1.6} />;
}

function CheckIcon() {
  return <Check size={14} strokeWidth={2} />;
}
