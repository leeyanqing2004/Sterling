import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import styles from "./ManageEvent.module.css";
import { useAuth } from "../contexts/AuthContext";
import NewGuestPopup from "../components/NewGuestPopup";
import NewOrganizerPopup from "../components/NewOrganizerPopup";
import ConfirmDeletePopup from "../components/ConfirmDeletePopup";

function ManageEvent() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [pointsRemain, setPointsRemain] = useState("");
    const [pointsAwarded, setPointsAwarded] = useState("");
    const [published, setPublished] = useState(false);

    const [organizers, setOrganizers] = useState([]);
    const [guests, setGuests] = useState([]);

    const [errors, setErrors] = useState({});
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [showOrganizerPopup, setShowOrganizerPopup] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const loadEvent = useCallback(async () => {
        try {
            const response = await api.get(`/events/${eventId}`);
            const event = response.data;
            
            setName(event.name || "");
            setDescription(event.description || "");
            setLocation(event.location || "");
            setStartTime(event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "");
            setEndTime(event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : "");
            setCapacity(event.capacity?.toString() || "");
            setPointsRemain(event.pointsRemain?.toString() || "");
            setPointsAwarded(event.pointsAwarded?.toString() || "");
            setPublished(event.published || false);
            setOrganizers(event.organizers || []);
            setGuests(event.guests || []);
            const organizerMatch = event.organizers?.some((o) => o.utorid === user?.utorid);
            setIsOrganizer(Boolean(organizerMatch));
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed to load event", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [eventId, user?.utorid]);

    useEffect(() => {
        loadEvent();
    }, [loadEvent]);

    const validateForm = () => {
        const newErrors = {};
        const now = new Date();

        if (name.length > 100) newErrors.name = "Name is too long";
        if (description.length > 500) newErrors.description = "Description is too long";
        
        if (startTime) {
            const start = new Date(startTime);
            if (start < now) newErrors.startTime = "Cannot be in the past";
        }

        if (endTime && startTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (end <= start) newErrors.endTime = "Must be after start time";
        }

        if (capacity && (isNaN(capacity) || parseInt(capacity) < 0)) {
            newErrors.capacity = "Must be a positive value";
        }

        if (pointsRemain && (isNaN(pointsRemain) || parseFloat(pointsRemain) < 0)) {
            newErrors.pointsRemain = "Must be a positive value";
        }

        if (pointsAwarded && (isNaN(pointsAwarded) || parseFloat(pointsAwarded) < 0)) {
            newErrors.pointsAwarded = "Must be a positive value";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setToast({ message: "Please fix validation errors", type: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const updateData = {};
            if (name) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (location) updateData.location = location;
            if (startTime) updateData.startTime = new Date(startTime).toISOString();
            if (endTime) updateData.endTime = new Date(endTime).toISOString();
            if (capacity !== "") updateData.capacity = capacity ? parseInt(capacity) : null;

            if (canEditRestrictedFields) {
                if (pointsRemain !== "") updateData.pointsRemain = parseFloat(pointsRemain);
                if (pointsAwarded !== "") updateData.pointsAwarded = parseFloat(pointsAwarded);
                updateData.published = published;
            }

            await api.patch(`/events/${eventId}`, updateData);
            navigate("/all-events", { state: { success: "Event updated successfully" } });
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed to update event", type: "error" });
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            await api.delete(`/events/${eventId}`);
            navigate("/all-events", { state: { success: "Event deleted successfully" } });
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed to delete event", type: "error" });
            setDeleting(false);
        } finally {
            setShowDeletePopup(false);
        }
    };

    const handleGuestSuccess = () => {
        setShowGuestPopup(false);
        loadEvent();
        setToast({ message: "Guest added successfully", type: "success" });
    };

    const handleOrganizerSuccess = () => {
        setShowOrganizerPopup(false);
        loadEvent();
        setToast({ message: "Organizer added successfully", type: "success" });
    };

    const handleRemoveOrganizer = async (userId) => {
        try {
            await api.delete(`/events/${eventId}/organizers/${userId}`);
            setOrganizers(organizers.filter((o) => o.id !== userId));
            setToast({ message: "Organizer removed successfully", type: "success" });
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed to remove organizer", type: "error" });
        }
    };

    const handleRemoveGuest = async (userId) => {
        try {
            await api.delete(`/events/${eventId}/guests/${userId}`);
            setGuests(guests.filter((g) => g.id !== userId));
            setToast({ message: "Guest removed successfully", type: "success" });
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed to remove guest", type: "error" });
        }
    };

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    const canEditRestrictedFields = isManagerOrSuperuser;
    const canDeleteEvent = isManagerOrSuperuser;
    const canModifyOrganizers = isManagerOrSuperuser;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate("/all-events")}>
                ← Back to Events
            </button>
            
            <div className={styles.contentCard}>
                <h1 className={styles.title}>Manage Event #{eventId}</h1>

                <div className={styles.formGrid}>
                <div className={styles.formColumn}>
                    <div className={styles.formField}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                        />
                        {errors.name && <span className={styles.error}>{errors.name}</span>}
                    </div>

                    <div className={styles.formField}>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={4}
                        />
                        {errors.description && <span className={styles.error}>{errors.description}</span>}
                    </div>

                    <div className={styles.formField}>
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                        {errors.startTime && <span className={styles.error}>{errors.startTime}</span>}
                    </div>

                    <div className={styles.formField}>
                        <label>End Time</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                        {errors.endTime && <span className={styles.error}>{errors.endTime}</span>}
                    </div>
                </div>

                <div className={styles.formColumn}>
                    <div className={styles.formField}>
                        <label>Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className={styles.formField}>
                        <label>Capacity</label>
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            min="0"
                        />
                        {errors.capacity && <span className={styles.error}>{errors.capacity}</span>}
                    </div>

                    <div className={styles.formField}>
                        <label>Points Remaining</label>
                        <input
                            type="number"
                            value={pointsRemain}
                            onChange={(e) => setPointsRemain(e.target.value)}
                            min="0"
                            step="0.01"
                            disabled={!canEditRestrictedFields}
                        />
                        {errors.pointsRemain && <span className={styles.error}>{errors.pointsRemain}</span>}
                    </div>

                    <div className={styles.formField}>
                        <label>Points Awarded</label>
                        <input
                            type="number"
                            value={pointsAwarded}
                            onChange={(e) => setPointsAwarded(e.target.value)}
                            min="0"
                            step="0.01"
                            disabled={!canEditRestrictedFields}
                        />
                        {errors.pointsAwarded && <span className={styles.error}>{errors.pointsAwarded}</span>}
                    </div>
                </div>

                <div className={styles.formColumn}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>Organizers</h3>
                            {canModifyOrganizers && (
                                <button
                                    className={styles.addButton}
                                    onClick={() => setShowOrganizerPopup(true)}
                                >
                                    + Add Organizer
                                </button>
                            )}
                        </div>
                        <div className={styles.list}>
                            {organizers.map((organizer) => (
                                <div key={organizer.id} className={styles.listItem}>
                                    <span>{organizer.utorid}</span>
                                    {canModifyOrganizers && (
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveOrganizer(organizer.id)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {organizers.length === 0 && (
                                <div className={styles.emptyList}>No organizers</div>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>Guests</h3>
                            <button className={styles.addButton} onClick={() => setShowGuestPopup(true)}>
                                + Add Guest
                            </button>
                        </div>
                        <div className={styles.list}>
                            {guests.map((guest) => (
                                <div key={guest.id} className={styles.listItem}>
                                    <span>{guest.utorid}</span>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveGuest(guest.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {guests.length === 0 && (
                                <div className={styles.emptyList}>No guests</div>
                            )}
                        </div>
                        <div className={styles.checkboxContainer}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={published}
                                    onChange={(e) => setPublished(e.target.checked)}
                                    disabled={!canEditRestrictedFields}
                                />
                                Publish event
                            </label>
                        </div>
                    </div>
                </div>
                </div>

                <div className={styles.actions}>
                {canDeleteEvent && (
                    <button
                        className={styles.deleteButton}
                        onClick={() => setShowDeletePopup(true)}
                        disabled={deleting}
                    >
                        🗑 Delete Event
                    </button>
                )}
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={submitting}
                >
                    {submitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
            </div>

            {toast && (
                <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
                    {toast.message}
                </div>
            )}

            {showGuestPopup && (
                <NewGuestPopup
                    eventId={eventId}
                    onClose={() => setShowGuestPopup(false)}
                    onSuccess={handleGuestSuccess}
                />
            )}

            {showOrganizerPopup && (
                <NewOrganizerPopup
                    eventId={eventId}
                    onClose={() => setShowOrganizerPopup(false)}
                    onSuccess={handleOrganizerSuccess}
                />
            )}

            {showDeletePopup && (
                <ConfirmDeletePopup
                    message="Are you sure you want to delete this event? This action cannot be undone."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        if (!deleting) setShowDeletePopup(false);
                    }}
                    loading={deleting}
                />
            )}
        </div>
    );
}

export default ManageEvent;

