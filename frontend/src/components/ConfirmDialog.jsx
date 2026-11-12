import { useEffect } from 'react';
import { CircleAlert } from 'lucide-react';

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
  return <CircleAlert size={20} strokeWidth={1.8} color="#F5B84E" />;
}
