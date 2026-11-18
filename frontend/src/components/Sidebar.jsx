import {
  PanelLeft,
  MessageSquarePlus,
  Lightbulb,
  Compass,
  ChevronRight,
  Trash2,
  Settings,
} from 'lucide-react';

export default function Sidebar({
  open,
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  onClearGroup,
  onOpenAssistant,
  onOpenSettings,
  onClose,
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups = [
    { key: 'project', title: '项目', items: sorted.filter((item) => item.assistant) },
    { key: 'chat', title: '对话', items: sorted.filter((item) => !item.assistant) },
  ];

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

      <div className="new-chat-wrap">
        <button type="button" className="new-chat-button" onClick={onNewChat}>
          <MessageSquarePlus size={16} strokeWidth={1.5} />
          <span>新对话</span>
        </button>
      </div>

      <nav className="side-nav">
        <button type="button" className="side-nav-item" onClick={onOpenAssistant}>
          <Lightbulb size={15} strokeWidth={1.5} />
          <span>个人助手</span>
          <ChevronRight size={15} strokeWidth={1.5} />
        </button>
        <button type="button" className="side-nav-item">
          <Compass size={15} strokeWidth={1.5} />
          <span>定时任务</span>
          <ChevronRight size={15} strokeWidth={1.5} />
        </button>
      </nav>

      <div className="side-sections">
        {groups.map((group) => (
          <section className="side-group" key={group.key}>
            <div className="group-header">
              <span className="group-title">{group.title}</span>
              <button
                type="button"
                className="group-clear"
                aria-label={`全部清除${group.title}`}
                onClick={() => onClearGroup(group.key)}
              >
                <Trash2 size={16} strokeWidth={1.3} />
                <span className="group-clear-tooltip" role="tooltip">全部清除</span>
              </button>
            </div>

            <nav className="conversation-list">
              {group.items.length === 0 ? (
                <p className="conversation-empty">暂无{group.title}</p>
              ) : (
                group.items.map((conversation) => (
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
                        style={{ background: conversation.assistant?.iconBg || '#d5d7ef' }}
                      />
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
        ))}
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

function PanelLeftIcon() {
  return <PanelLeft size={18} strokeWidth={1.7} />;
}
