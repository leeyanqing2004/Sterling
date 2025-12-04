import "./ConfirmDeletePopup.css";

function ConfirmDeletePopup({ title = "Delete Event", message, onConfirm, onCancel, loading }) {
    return (
        <div className="confirm-delete-overlay" onClick={onCancel}>
            <div className="confirm-delete-content" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="confirm-delete-actions">
                    <button className="confirm-delete-cancel" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button className="confirm-delete-confirm" onClick={onConfirm} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeletePopup;

