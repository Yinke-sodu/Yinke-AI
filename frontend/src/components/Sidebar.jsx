import { PanelLeft, Plus, Lightbulb, Clock, ChevronRight, Trash2, Settings } from 'lucide-react';

export default function Sidebar({
  open,
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  onClearAll,
  onOpenAssistant,
  onClose,
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
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
          <PanelLeftIcon />
        </button>
      </div>

      <button type="button" className="new-chat-button" onClick={onNewChat}>
        <PlusIcon />
        <span>新对话</span>
      </button>

      <nav className="side-nav">
        <button type="button" className="side-nav-item active" onClick={onOpenAssistant}>
          <BulbIcon />
          <span>个人助手</span>
          <ChevronRightIcon />
        </button>
        <button type="button" className="side-nav-item">
          <ClockIcon />
          <span>定时任务</span>
          <ChevronRightIcon />
        </button>
      </nav>

      <div className="history-label">
        <span>问答历史</span>
        <button
          type="button"
          className="history-clear"
          aria-label="全部清除"
          onClick={onClearAll}
        >
          <TrashIcon />
          <span className="history-clear-tooltip" role="tooltip">全部清除</span>
        </button>
      </div>

      <nav className="conversation-list">
        {sorted.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${conversation.id === activeId ? 'active' : ''}`}
          >
            <button
              type="button"
              className="conversation-button"
              onClick={() => onSelect(conversation.id)}
            >
              <img
                className="conversation-avatar"
                src={conversation.assistant?.icon || '/assets/conversation-avatar.png'}
                alt=""
                style={{ background: conversation.assistant?.iconBg || '#fff' }}
              />
              <span className="conversation-title">{conversation.title}</span>
            </button>
            <button
              type="button"
              className="conversation-delete"
              aria-label={`删除对话：${conversation.title}`}
              onClick={() => onDelete(conversation.id)}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button type="button" className="settings-row">
          <GearIcon />
          <span>设置</span>
          <ChevronRightIcon />
        </button>
      </div>
    </aside>
  );
}

function PanelLeftIcon() {
  return <PanelLeft size={18} strokeWidth={1.7} />;
}

function PlusIcon() {
  return <Plus size={16} strokeWidth={2} />;
}

function BulbIcon() {
  return <Lightbulb size={16} strokeWidth={1.6} />;
}

function ClockIcon() {
  return <Clock size={16} strokeWidth={1.6} />;
}

function ChevronRightIcon() {
  return <ChevronRight size={14} strokeWidth={1.8} />;
}

function TrashIcon() {
  return <Trash2 size={14} strokeWidth={1.7} />;
}

function GearIcon() {
  return <Settings size={16} strokeWidth={1.6} />;
}
