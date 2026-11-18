import { useState } from 'react';

const ROUTE_MODES = [
  {
    key: 'smart',
    title: '智能路由',
    badge: '推荐',
    desc: '系统按策略自动挑选模型（如简单问题用本地、复杂问题用云端）',
  },
  {
    key: 'fixed',
    title: '固定模型',
    desc: '所有对话都使用下方选中的模型，不随问题难度切换',
  },
];

const STRATEGIES = [
  {
    key: 'balanced',
    title: 'Balanced（均衡策略）',
    desc: '规划请求选高复杂度渠道 → 其余按对话长短分档 → 最后按优先级兜底',
  },
  {
    key: 'costFirst',
    title: 'CostFirst（省钱优先）',
    desc: '先用免费渠道 → 没有免费的再按渠道优先级兜底',
  },
  {
    key: 'intelligent',
    title: 'Intelligent（智能策略）',
    desc: '自动判断难易：简单走本地、困难走云端 → 其余按优先级兜底',
  },
  {
    key: 'local',
    title: 'Local（本地优先）',
    desc: '优先本地渠道 → 本地不可用时兜底、可能上云（有费用、向量不一致），敏感场景请改用 LocalOnly 策略',
  },
  {
    key: 'localOnly',
    title: 'LocalOnly（仅限本地）',
    badge: '无兜底',
    desc: '只走本地渠道：本地不可用直接报错、绝不上云（需渠道已标记为本地）',
  },
];

export default function SettingsPage() {
  const [routeMode, setRouteMode] = useState('smart');
  const [strategy, setStrategy] = useState('balanced');
  const [thinkButton, setThinkButton] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  return (
    <div className="settings-scroll">
      <div className="settings-page">
        <h1 className="settings-title">设置</h1>

        <section className="settings-section">
          <header className="settings-section-head">
            <div className="settings-section-intro">
              <h2 className="settings-section-title">模型路由</h2>
              <p className="settings-section-desc">决定每条对话由哪个模型回答</p>
            </div>
            <button type="button" className="settings-button settings-button-plain">
              刷新
            </button>
          </header>

          <div className="settings-card">
            {ROUTE_MODES.map((mode, index) => (
              <div className="settings-item-block" key={mode.key}>
                {index > 0 && <span className="settings-item-divider" />}
                <div className="settings-item">
                  <div className="settings-item-text">
                    <div className="settings-item-name">
                      <span className="settings-item-title">{mode.title}</span>
                      {mode.badge && (
                        <span className="settings-tag settings-tag-recommend">{mode.badge}</span>
                      )}
                    </div>
                    <p className="settings-item-desc">{mode.desc}</p>
                  </div>
                  <Radio checked={routeMode === mode.key} onClick={() => setRouteMode(mode.key)} label={mode.title} />
                </div>
              </div>
            ))}
          </div>

          <div className="settings-subhead">
            <h3 className="settings-subhead-title">对话策略</h3>
            <p className="settings-subhead-desc">
              选择后，每条对话由系统按该策略自动挑选模型；默认选中「智能策略」
            </p>
          </div>

          <div className="settings-card">
            {STRATEGIES.map((item, index) => (
              <div className="settings-item-block" key={item.key}>
                {index > 0 && <span className="settings-item-divider" />}
                <div className="settings-item">
                  <div className="settings-item-text">
                    <div className="settings-item-name">
                      <span className="settings-item-title">{item.title}</span>
                      {item.badge && (
                        <span className="settings-tag settings-tag-outline">{item.badge}</span>
                      )}
                    </div>
                    <p className="settings-item-desc">{item.desc}</p>
                  </div>
                  <Radio checked={strategy === item.key} onClick={() => setStrategy(item.key)} label={item.title} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <header className="settings-section-head">
            <div className="settings-section-intro">
              <h2 className="settings-section-title">对话与搜索</h2>
              <p className="settings-section-desc">调整对话输入与知识库搜索的细节行为</p>
            </div>
          </header>

          <div className="settings-card">
            <div className="settings-item-block">
              <div className="settings-item settings-item-wide">
                <div className="settings-item-text">
                  <div className="settings-item-name">
                    <span className="settings-item-title">知识库搜索上限</span>
                  </div>
                  <p className="settings-item-desc">每次搜索每种类型（图片、视频）最多返回的条数</p>
                </div>
                <button type="button" className="settings-button settings-button-value">20</button>
              </div>
            </div>

            <span className="settings-item-divider" />

            <div className="settings-item-block">
              <div className="settings-item settings-item-wide">
                <div className="settings-item-text">
                  <div className="settings-item-name">
                    <span className="settings-item-title">输入框显示思考按钮</span>
                  </div>
                  <p className="settings-item-desc">当前已显示，可按需开启思考模式</p>
                </div>
                <Switch checked={thinkButton} onChange={setThinkButton} label="输入框显示思考按钮" />
              </div>
            </div>

            <span className="settings-item-divider" />

            <div className="settings-item-block">
              <div className="settings-item settings-item-wide">
                <div className="settings-item-text">
                  <div className="settings-item-name">
                    <span className="settings-item-title">联网搜索服务</span>
                  </div>
                  <p className="settings-item-desc">测试应用中心中 "SearXNG" 搜索服务是否可用</p>
                </div>
                <button type="button" className="settings-button">检查</button>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <header className="settings-section-head">
            <div className="settings-section-intro">
              <h2 className="settings-section-title">消息推送</h2>
            </div>
          </header>

          <div className="settings-card">
            <div className="settings-item-block">
              <div className="settings-item settings-item-wide">
                <div className="settings-item-text">
                  <div className="settings-item-name">
                    <span className="settings-item-title">消息推送</span>
                  </div>
                  <p className="settings-item-desc">通知会先写入通知中心，再推送到下方已配置的通道</p>
                </div>
                <Switch checked={pushEnabled} onChange={setPushEnabled} label="消息推送" />
              </div>
            </div>

            <span className="settings-item-divider" />

            <div className="settings-item-block">
              <div className="settings-item settings-item-wide">
                <div className="settings-item-text">
                  <div className="settings-item-name">
                    <span className="settings-item-title">IM 推送</span>
                    <span className="settings-tag settings-tag-muted">未配置</span>
                  </div>
                  <p className="settings-item-desc">
                    启用渠道后即可在 IM 里与机器人对话（微信渠道扫码后自动创建并启用，无需 /bind）；在 IM
                    里向机器人发送 /bind 绑定 NAS 身份后，告警与定时任务会推送到你绑定的聊天；停用渠道即停止对话与推送。
                  </p>
                </div>
                <button type="button" className="settings-button">＋ 新建渠道</button>
              </div>
            </div>

            <span className="settings-item-divider" />

            <div className="settings-item-block">
              <div className="settings-item settings-item-wide">
                <div className="settings-item-text">
                  <div className="settings-item-name">
                    <span className="settings-item-title">邮箱推送</span>
                    <span className="settings-tag settings-tag-muted">未配置</span>
                  </div>
                  <p className="settings-item-desc">通过你的邮箱 SMTP 服务发送（如 QQ/163/企业邮箱的授权码）</p>
                </div>
                <button type="button" className="settings-button">配置</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Radio({ checked, onClick, label }) {
  return (
    <button
      type="button"
      className={`settings-radio ${checked ? 'checked' : ''}`}
      role="radio"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
    >
      <span className="settings-radio-dot" />
    </button>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`settings-switch ${checked ? 'on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange((prev) => !prev)}
    >
      <span className="settings-switch-thumb" />
    </button>
  );
}
