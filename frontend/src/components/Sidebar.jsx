import {
  PanelLeft,
  MessageSquarePlus,
  Lightbulb,
  Compass,
  Sparkles,
  ChevronRight,
  CircleAlert,
  Trash2,
  Settings,
} from 'lucide-react';

const AGENT_HINT =
  '检测到当前电脑硬件配置较低，开启“个人助手、自动化、技能”等 Agent 功能可能导致运行卡顿或响应缓慢。';

export default function Sidebar({
  open,
  conversations,
  activeId,
  mode,
  onModeChange,
  onNewChat,
  onSelect,
  onDelete,
  onClearAll,
  onOpenAssistant,
  onOpenSettings,
  onClose,
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-head">
        <div className="sidebar-brand">
          <div className="brand">
            <img className="brand-logo" src="/assets/logo.png" alt="GEAK AI" />
            <span className="brand-name">GEAK AI</span>
          </div>
          <button
            type="button"
            className="icon-button sidebar-close"
            aria-label="收起侧边栏"
            onClick={onClose}
          >
            <PanelLeft size={18} strokeWidth={1.7} />
          </button>
        </div>

        <div className="mode-switch" role="tablist" aria-label="对话模式">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'standard'}
            className={`mode-option ${mode === 'standard' ? 'active standard' : ''}`}
            onClick={() => onModeChange('standard')}
          >
            标准模式
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'lite'}
            className={`mode-option ${mode === 'lite' ? 'active lite' : ''}`}
            onClick={() => onModeChange('lite')}
          >
            轻量对话
          </button>
        </div>
      </div>

      <div className="new-chat-wrap">
        <button type="button" className="new-chat-button" onClick={onNewChat}>
          <MessageSquarePlus size={16} strokeWidth={1.5} />
          <span>新对话</span>
        </button>
      </div>

      {mode === 'standard' && (
        <nav className="side-nav">
          <button type="button" className="side-nav-item" onClick={onOpenAssistant}>
            <Lightbulb size={16} strokeWidth={1.3} />
            <span>个人助手</span>
            <NavHint label={AGENT_HINT} />
          </button>
          <button type="button" className="side-nav-item">
            <Compass size={16} strokeWidth={1.3} />
            <span>定时任务</span>
            <NavHint label={AGENT_HINT} />
          </button>
          <button type="button" className="side-nav-item">
            <Sparkles size={16} strokeWidth={1.3} />
            <span>技能</span>
            <NavHint label={AGENT_HINT} />
          </button>
        </nav>
      )}

      <div className="side-sections">
        <section className="side-group">
          <div className="group-header">
            <span className="group-title">历史对话</span>
            <button
              type="button"
              className="group-clear"
              aria-label="全部清除历史对话"
              onClick={onClearAll}
            >
              <Trash2 size={16} strokeWidth={1.3} />
              <span className="group-clear-tooltip" role="tooltip">全部清除</span>
            </button>
          </div>

          <nav className="conversation-list">
            {sorted.length === 0 ? (
              <p className="conversation-empty">暂无项目</p>
            ) : (
              sorted.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${conversation.id === activeId ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="conversation-button"
                    onClick={() => onSelect(conversation.id)}
                  >
                    {mode === 'standard' && (
                      <img
                        className="conversation-avatar"
                        src={conversation.assistant?.icon || '/assets/conversation-avatar.png'}
                        alt=""
                        style={{ background: conversation.assistant?.iconBg || '#d5d7ef' }}
                      />
                    )}
                    <span className="conversation-title">{conversation.title}</span>
                  </button>
                  <button
                    type="button"
                    className="conversation-delete"
                    aria-label={`删除对话：${conversation.title}`}
                    onClick={() => onDelete(conversation.id)}
                  >
                    <Trash2 size={16} strokeWidth={1.3} />
                  </button>
                </div>
              ))
            )}
          </nav>
        </section>
      </div>

      <div className="sidebar-foot">
        <span className="sidebar-divider" />
        <button type="button" className="settings-row" onClick={onOpenSettings}>
          <Settings size={16} strokeWidth={1.6} />
          <span>设置</span>
          <ChevronRight size={15} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}

function NavHint({ label }) {
  return (
    <span className="side-nav-hint">
      <CircleAlert size={15} strokeWidth={1.25} />
      <span className="side-nav-tooltip" role="tooltip">{label}</span>
    </span>
  );
}
