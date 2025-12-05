import { useState } from "react";
import api from "../../api/api";
import "./NewGuestPopup.module.css";

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
        <div className="new-guest-popup" onClick={onClose}>
            <div className="new-guest-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="new-guest-popup-close-button" onClick={onClose}>
                    X
                </button>
                <h2 className="new-guest-popup-title">New Organizer</h2>
                <div className="new-guest-popup-utorid">
                    <label
                        className="new-guest-popup-utorid-label"
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
                    />
                    {error && <span className="new-guest-popup-error">{error}</span>}
                </div>
                <button
                    className="new-guest-popup-add-guest-button"
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

