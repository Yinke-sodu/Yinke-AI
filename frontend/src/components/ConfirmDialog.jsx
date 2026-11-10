import { useEffect } from 'react';

export default function ConfirmDialog({ title, description, confirmText, onCancel, onConfirm }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog-head">
          <span className="confirm-dialog-icon" aria-hidden="true">
            <WarningIcon />
          </span>
          <div className="confirm-dialog-text">
            <h2 className="confirm-dialog-title" id="confirm-dialog-title">
              {title}
            </h2>
            <p className="confirm-dialog-desc">{description}</p>
          </div>
        </div>

        <div className="confirm-dialog-actions">
          <button type="button" className="dialog-button dialog-button-ghost" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="dialog-button dialog-button-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
      <circle cx="10" cy="10" r="8.333" fill="#F5B84E" />
      <path d="M10 5.8v5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="0.95" fill="#fff" />
    </svg>
  );
}
