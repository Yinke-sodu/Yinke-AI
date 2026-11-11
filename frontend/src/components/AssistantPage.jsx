export const ASSISTANTS = [
  {
    key: 'smart',
    title: '智能管家',
    desc: '你的智能管家，懂状态、管文件、管相册，一句话就能搞定 NAS 日常。',
    icon: '/assets/assistant/smart.png',
    iconBg: '#d5d7ef',
  },
  {
    key: 'media',
    title: '影音管家',
    desc: '管理你的影音库：找片、整理海报、续播记录一键同步。',
    icon: '/assets/assistant/media.png',
    iconBg: '#f2dbd7',
  },
  {
    key: 'diagnosis',
    title: '诊断管家',
    desc: '关注你的 NAS 健康：温度、风扇、磁盘异常及时提醒。',
    icon: '/assets/assistant/diagnosis.png',
    iconBg: '#e3f1f5',
  },
  {
    key: 'creation',
    title: '创作管家',
    desc: '管理你的创作素材：灵感、草稿、成稿集中存放随时调用。',
    icon: '/assets/assistant/creation.png',
    iconBg: '#dae8d8',
  },
  {
    key: 'container',
    title: '容器管家',
    desc: '管理你的 Docker 容器：查看运行状态、启停服务、清理镜像。',
    icon: '/assets/assistant/container.png',
    iconBg: '#e3f1f5',
  },
  {
    key: 'file',
    title: '文件管家',
    desc: '管理你的文件：浏览目录、搜索内容、批量整理与分享。',
    icon: '/assets/assistant/file.png',
    iconBg: '#dae8d8',
  },
  {
    key: 'download',
    title: '下载管家',
    desc: '管理你的下载任务：添加链接、查看进度、自动归档到指定目录。',
    icon: '/assets/assistant/download.png',
    iconBg: '#dae8d8',
  },
  {
    key: 'album',
    title: '相册管家',
    desc: '管理你的相册：按时间地点归类、人脸识别、一键备份手机照片。',
    icon: '/assets/assistant/album.png',
    iconBg: '#f2dbd7',
  },
  {
    key: 'backup',
    title: '备份管家',
    desc: '管理你的备份任务：定时同步、版本留存、一键恢复重要数据。',
    icon: '/assets/assistant/backup.png',
    iconBg: '#dae8d8',
  },
];

export default function AssistantPage({ onOpen }) {
  return (
    <div className="assistant-scroll">
      <div className="assistant-page">
        <header className="assistant-head">
          <span className="assistant-eyebrow">你好, 我是GEAK AI</span>
          <h1 className="assistant-title">这里是NAS 智能管家助手</h1>
        </header>

        <section className="assistant-grid">
          {ASSISTANTS.map((item) => (
            <button
              type="button"
              className="assistant-card"
              key={item.key}
              onClick={() => onOpen(item)}
            >
              <span className="assistant-card-icon" style={{ background: item.iconBg }}>
                <img src={item.icon} alt="" />
              </span>
              <span className="assistant-card-body">
                <span className="assistant-card-title">{item.title}</span>
                <span className="assistant-card-desc">{item.desc}</span>
              </span>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
