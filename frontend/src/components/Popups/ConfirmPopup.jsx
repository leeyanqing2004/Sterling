import React from "react";
import "./DetailsPopup.css";

function ConfirmPopup({
  open = false,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmClassName = "action-btn",
  cancelClassName = "unrsvp-btn"
}) {
  if (!open) return null;
  
  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-content confirm-popup-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onCancel} aria-label="Close">×</button>
        <h2 className="popup-title">{title}</h2>
        {message && <p style={{ margin: '1rem 0', color: 'var(--color-info)' }}>{message}</p>}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className={cancelClassName} onClick={onCancel} style={{ flex: 1 }}>
            {cancelLabel}
          </button>
          <button className={confirmClassName} onClick={onConfirm} style={{ flex: 1 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPopup;
