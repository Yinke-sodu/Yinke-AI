export default function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? 'toast-visible' : ''}`} role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
          <circle cx="8" cy="8" r="8" fill="#4F46E5" />
          <path d="M4.8 8.2l2.1 2.1 4.3-4.3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="toast-text">{message}</span>
    </div>
  );
}
