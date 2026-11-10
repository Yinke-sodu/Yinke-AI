import { useRef, useState } from 'react';

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'log', 'xml', 'yml', 'yaml',
  'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'py', 'java', 'go', 'rs', 'sh',
  'sql', 'toml', 'ini', 'conf',
]);
const MAX_TEXT_SIZE = 1024 * 1024;

export default function Composer({ onSend, onStop, pending, placeholder, variant = 'docked' }) {
  const [value, setValue] = useState('');
  const [activeTools, setActiveTools] = useState({});
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const composingRef = useRef(false);

  async function handleFiles(event) {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (picked.length === 0) return;

    const loaded = await Promise.all(
      picked.map(async (file) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const readable = TEXT_EXTENSIONS.has(extension) && file.size <= MAX_TEXT_SIZE;
        let content = null;
        if (readable) {
          try {
            content = await file.text();
          } catch {
            content = null;
          }
        }
        return {
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          content,
        };
      }),
    );

    setAttachments((prev) => [...prev, ...loaded]);
  }

  function removeAttachment(id) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  function buildMessage(text) {
    const blocks = attachments.map((item) =>
      item.content === null
        ? `【附件：${item.name}】（未读取内容）`
        : `【附件：${item.name}】\n\`\`\`\n${item.content}\n\`\`\``,
    );
    return [text, ...blocks].filter(Boolean).join('\n\n');
  }

  function submit() {
    const text = value.trim();
    if ((!text && attachments.length === 0) || pending) return;
    onSend(buildMessage(text));
    setValue('');
    setAttachments([]);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    if (event.nativeEvent.isComposing || composingRef.current) return;
    event.preventDefault();
    submit();
  }

  return (
    <div className={`composer composer-${variant}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="composer-file-input"
        onChange={handleFiles}
      />

      {attachments.length > 0 && (
        <div className="composer-attachments">
          {attachments.map((item) => (
            <span className="attachment-chip" key={item.id}>
              <FileIcon />
              <span className="attachment-name">{item.name}</span>
              <button
                type="button"
                className="attachment-remove"
                aria-label={`移除附件 ${item.name}`}
                onClick={() => removeAttachment(item.id)}
              >
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="composer-input"
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
        }}
        autoFocus={variant === 'welcome'}
      />

      <div className="composer-toolbar">
        <div className="composer-tools">
          <button
            type="button"
            className="tool-square"
            aria-label="添加文件"
            title="上传本地文件"
            onClick={() => fileInputRef.current?.click()}
          >
            <PlusIcon />
          </button>
          {[
            { key: 'think', label: '思考', icon: <ThinkIcon /> },
            { key: 'web', label: '联网', icon: <GlobeIcon /> },
            { key: 'skill', label: '技能', icon: <SkillIcon /> },
          ].map((tool) => (
            <button
              key={tool.key}
              type="button"
              className={`tool-chip ${activeTools[tool.key] ? 'active' : ''}`}
              aria-pressed={Boolean(activeTools[tool.key])}
              onClick={() =>
                setActiveTools((prev) => ({ ...prev, [tool.key]: !prev[tool.key] }))
              }
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        <div className="composer-actions">
          <button type="button" className="mic-button" aria-label="语音输入">
            <MicIcon />
          </button>
          <button
            type="button"
            className={`send-button ${pending ? 'send-button-stop' : ''}`}
            onClick={pending ? onStop : submit}
            disabled={!pending && !value.trim() && attachments.length === 0}
            aria-label={pending ? '停止生成' : '发送消息'}
            title={pending ? '停止生成' : '发送'}
          >
            {pending ? <StopIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ThinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3.5 10.9c.4.3.5.7.5 1.1h6c0-.4.1-.8.5-1.1A6 6 0 0012 3z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18-2.5-3-2.5-15.5 0-18z" />
    </svg>
  );
}

function SkillIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5 12 3z" />
      <path d="M18 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor" stroke="none">
      <rect x="0" y="0" width="10" height="10" rx="2.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
