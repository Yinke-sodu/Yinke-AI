import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
import { Plus, Lightbulb, Globe, Sparkles, Mic, ArrowUp, Square, FileText, X as XIcon } from 'lucide-react';
import waveformAnimation from '../assets/waveform.json';

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'log', 'xml', 'yml', 'yaml',
  'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'py', 'java', 'go', 'rs', 'sh',
  'sql', 'toml', 'ini', 'conf',
]);
const MAX_TEXT_SIZE = 1024 * 1024;
const CONTEXT_LIMIT = 128000;
const SKILL_OPTIONS = ['财务管理', '法律咨询', '健康管理', '命理测算', '健身指导'];

function estimateTokens(messages) {
  const text = messages.map((message) => message.content || '').join('\n');
  const cjkCount = (text.match(/[一-鿿]/g) || []).length;
  return Math.round(cjkCount + (text.length - cjkCount) / 4);
}

function formatTokens(count) {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

export default function Composer({ onSend, onStop, pending, placeholder, variant = 'docked', messages = [], modelName = '', modelOnline = false }) {
  const [value, setValue] = useState('');
  const [activeTools, setActiveTools] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const composingRef = useRef(false);
  const contextRef = useRef(null);

  const inputTokens = estimateTokens(messages.filter((message) => message.role === 'user'));
  const outputTokens = estimateTokens(messages.filter((message) => message.role === 'assistant'));
  const usedTokens = inputTokens + outputTokens;
  const requestCount = messages.filter((message) => message.role === 'user').length;
  const contextPercent = Math.min(100, Math.round((usedTokens / CONTEXT_LIMIT) * 100));
  const usedTokensLabel = `${(usedTokens / 1000).toFixed(1)}K`;

  useEffect(() => {
    if (!contextOpen) return undefined;
    function handleOutsideClick(event) {
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setContextOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [contextOpen]);

  function handleSelectSkill(option) {
    setSelectedSkill(option);
    setActiveTools((prev) => ({ ...prev, skill: true }));
  }

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
            <div
              key={tool.key}
              className={tool.key === 'skill' ? 'skill-menu-wrap' : undefined}
            >
              <button
                type="button"
                className={`tool-chip ${activeTools[tool.key] ? 'active' : ''}`}
                aria-pressed={Boolean(activeTools[tool.key])}
                onClick={() => {
                  if (tool.key === 'skill' && activeTools.skill) {
                    setSelectedSkill('');
                  }
                  setActiveTools((prev) => ({ ...prev, [tool.key]: !prev[tool.key] }));
                }}
              >
                <span className="chip-icon">{tool.icon}</span>
                <span>
                  {tool.key === 'skill' ? selectedSkill || tool.label : tool.label}
                </span>
              </button>
              {tool.key === 'skill' && (
                <div className="skill-menu" role="menu">
                  {SKILL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`skill-menu-item ${selectedSkill === option ? 'selected' : ''}`}
                      role="menuitem"
                      onClick={() => handleSelectSkill(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="composer-actions">
          <div className={`context-progress ${contextOpen ? 'open' : ''}`} ref={contextRef}>
            <button
              type="button"
              className="context-progress-button"
              aria-label={`本轮上下文 ${contextPercent}%`}
              aria-expanded={contextOpen}
              onClick={() => setContextOpen((prev) => !prev)}
            >
              <ContextRing percent={contextPercent} />
            </button>
            <div className="context-popover" role="tooltip">
              <div className="context-popover-usage">
                <div className="context-popover-head">
                  <span>本轮上下文 {contextPercent}%</span>
                  <span>{usedTokensLabel} / 128.0K</span>
                </div>
                <div className="context-popover-bar">
                  <span style={{ width: `${contextPercent}%` }} />
                </div>
              </div>
              <div className="context-popover-detail">
                <div className="context-popover-model">
                  <div className="context-popover-model-name">
                    <span>{modelName}</span>
                    <span className={`context-popover-badge ${modelOnline ? '' : 'offline'}`}>
                      {modelOnline ? '在线' : '离线'}
                    </span>
                  </div>
                  <div className="context-popover-stats">
                    输入 {formatTokens(inputTokens)} · 输出 {formatTokens(outputTokens)} · {requestCount} 次
                  </div>
                </div>
                <div className="context-popover-divider" />
                <div className="context-popover-total">
                  <span className="context-popover-total-label">总会话用量</span>
                  <span className="context-popover-total-value">{formatTokens(usedTokens)}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className={`mic-button ${recording ? 'recording' : ''}`}
            aria-label={recording ? '停止录音' : '语音输入'}
            onClick={() => setRecording((prev) => !prev)}
          >
            {recording ? <WaveformIcon /> : <MicIcon />}
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
  return <Plus size={14} strokeWidth={1.8} />;
}

function ThinkIcon() {
  return <Lightbulb size={14} strokeWidth={1.6} />;
}

function GlobeIcon() {
  return <Globe size={14} strokeWidth={1.6} />;
}

function SkillIcon() {
  return <Sparkles size={14} strokeWidth={1.6} />;
}

function ContextRing({ percent }) {
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <circle cx="7" cy="7" r={radius} stroke="#E6E6EB" strokeWidth="1.333" />
      <circle
        cx="7"
        cy="7"
        r={radius}
        stroke="#000"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - percent / 100)}
        transform="rotate(-90 7 7)"
      />
    </svg>
  );
}

function MicIcon() {
  return <Mic size={18} strokeWidth={1.7} />;
}

function WaveformIcon() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: waveformAnimation,
    });
    return () => animation.destroy();
  }, []);

  return <div ref={containerRef} className="waveform-lottie" />;
}

function SendIcon() {
  return <ArrowUp size={16} strokeWidth={2.2} />;
}

function StopIcon() {
  return <Square size={13} fill="currentColor" strokeWidth={0} />;
}

function FileIcon() {
  return <FileText size={13} strokeWidth={1.7} />;
}

function CloseIcon() {
  return <XIcon size={12} strokeWidth={2} />;
}
