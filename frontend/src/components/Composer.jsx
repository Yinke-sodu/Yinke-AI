import { useRef, useState } from 'react';

export default function Composer({ onSend, pending, placeholder, variant = 'docked' }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const composingRef = useRef(false);

  function submit() {
    const text = value.trim();
    if (!text || pending) return;
    onSend(text);
    setValue('');
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
          <button type="button" className="tool-square" aria-label="添加内容">
            <PlusIcon />
          </button>
          <button type="button" className="tool-chip">
            <ThinkIcon />
            <span>思考</span>
          </button>
          <button type="button" className="tool-chip">
            <GlobeIcon />
            <span>联网</span>
          </button>
          <button type="button" className="tool-chip">
            <SkillIcon />
            <span>技能</span>
          </button>
        </div>

        <div className="composer-actions">
          <button type="button" className="mic-button" aria-label="语音输入">
            <MicIcon />
          </button>
          <button
            type="button"
            className="send-button"
            onClick={submit}
            disabled={!value.trim() || pending}
            aria-label="发送消息"
          >
            {pending ? <span className="send-spinner" /> : <SendIcon />}
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
