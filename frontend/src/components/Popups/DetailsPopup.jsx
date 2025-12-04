import React from 'react';
import './DetailsPopup.css';

function DetailsPopup({
  title,
  fields = [],
  open = true,
  onClose,
  primaryAction,
  secondaryAction
}) {
  if (!open) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 className="popup-title">{title}</h2>
        <div className="info-list">
          {fields.map((field, idx) => (
            <div className="info-field" key={idx}>
              <span className="info-label">{field.label}</span>
              <span className="info-value">
                {(field.value !== undefined && field.value !== null && field.value !== '' && (!(Array.isArray(field.value)) || field.value.length))
                  ? (Array.isArray(field.value) ? field.value.join(', ') : String(field.value))
                  : <span className="placeholder">{field.placeholder || '-'}</span>
                }
              </span>
            </div>
          ))}
        </div>
        {secondaryAction &&
          <button className={secondaryAction.className} onClick={secondaryAction.onClick}>{secondaryAction.label}</button>
        }
        {primaryAction &&
          <button className={primaryAction.className} onClick={primaryAction.onClick}>{primaryAction.label}</button>
        }
      </div>
    </div>
  );
}

export default DetailsPopup;
