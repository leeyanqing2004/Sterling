import { useState } from "react";
import "./NewGuestPopup.css";

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
    return <div className="new-guest-popup">
        <div className="new-guest-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="new-guest-popup-close-button">X</button>
            <h2 className="new-guest-popup-title">New Guest</h2>
            <div className="new-guest-popup-utorid">
                <label 
                    className="new-guest-popup-utorid-label" 
                    htmlFor="new-guest-popup-utorid-input"
                >
                    Utorid
                </label>
                <input 
                    id="new-guest-popup-utorid-input"
                    type="text"
                    name="new-guest-popup-utorid-input"
                    placeholder="Enter utorid"
                    value={utorid}
                    onChange={(e) => setUtorid(e.target.value)}
                    disabled={submitting}
                />
                {error && <span className="new-guest-popup-error">{error}</span>}
            </div>
            <button 
                className="new-guest-popup-add-guest-button"
                onClick={handleSubmit}
                disabled={submitting}
            >
                Add guest
            </button>
        </div>
    </div>
}

export default NewGuestPopup;