import { useState } from "react";
import styles from "./NewGuestPopup.module.css";

function NewGuestPopup(eventId) {
    const [utorid, setUtorid] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setError("");

        const trimmed = utorid.trim();
        if (!trimmed) {
            setError("Please enter a valid utorid!");
            return;
        }

        setSubmitting(true);

        try {
            await api.post(`events/${eventId}/guests`, {
                utorid: trimmed
            });

            setUtorid("");
            setError("");
            alert("Guest added successfully!");
        } catch (err) {
            setError(err.response?.data?.error)
        } finally {
            setSubmitting(false);
        }
    };
    return <div className={styles.newGuestPopup}>
        <div className={styles.newGuestPopupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.newGuestPopupCloseButton}>X</button>
            <h2 className={styles.newGuestPopupTitle}>New Guest</h2>
            <div className={styles.newGuestPopupUtorid}>
                <label 
                    className={styles.newGuestPopupUtoridLabel} 
                    htmlFor={styles.newGuestPopupUtoridInput}
                >
                    Utorid
                </label>
                <input 
                    id={styles.newGuestPopupUtoridInput}
                    className={styles.newGuestPopupUtoridInput}
                    type="text"
                    name="new-guest-popup-utorid-input"
                    placeholder="Enter utorid"
                    value={utorid}
                    onChange={(e) => setUtorid(e.target.value)}
                    disabled={submitting}
                />
                {error && <span className={styles.newGuestPopupError}>{error}</span>}
            </div>
            <button 
                className={styles.newGuestPopupAddGuestButton}
                onClick={handleSubmit}
                disabled={submitting}
            >
                Add guest
            </button>
        </div>
    </div>
}

export default NewGuestPopup;