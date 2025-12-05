import { useState } from "react";
import api from "../api/api";
import styles from "./NewGuestPopup.module.css";

function NewOrganizerPopup({ eventId, onClose, onSuccess }) {
    const [utorid, setUtorid] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setError("");

        const trimmed = utorid.trim();
        if (!trimmed) {
            setError("Please enter a valid UTORid");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/events/${eventId}/organizers`, {
                utorid: trimmed,
            });
            setUtorid("");
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add organizer");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.newGuestPopup} onClick={onClose}>
            <div className={styles.newGuestPopupContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.newGuestPopupCloseButton} onClick={onClose}>
                    X
                </button>
                <h2 className={styles.newGuestPopupTitle}>New Organizer</h2>
                <div className={styles.newGuestPopupUtorid}>
                    <label
                        className={styles.newGuestPopupUtoridLabel}
                        htmlFor="new-organizer-popup-utorid-input"
                    >
                        UTORid
                    </label>
                    <input
                        id="new-organizer-popup-utorid-input"
                        type="text"
                        placeholder="Enter UTORid"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        disabled={submitting}
                        className={styles.newGuestPopupUtoridInput}
                    />
                    {error && <span className={styles.newGuestPopupError}>{error}</span>}
                </div>
                <button
                    className={styles.newGuestPopupAddGuestButton}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Adding..." : "Add organizer"}
                </button>
            </div>
        </div>
    );
}

export default NewOrganizerPopup;


