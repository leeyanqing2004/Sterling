import { useState, useEffect } from "react";
import styles from "./NewEventPopup.module.css";
import api from "../api/api";

function NewEventPopup({ show = false, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");
    const [points, setPoints] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!show) {
            setName("");
            setLocation("");
            setDescription("");
            setCapacity("");
            setPoints("");
            setStartTime("");
            setEndTime("");
            setErrors({});
            setSubmitting(false);
        }
    }, [show]);

    const validate = () => {
        const next = {};
        if (!name.trim()) next.name = "Name is required";
        if (!location.trim()) next.location = "Location is required";
        if (!description.trim()) next.description = "Description is required";

        const capacityNum = capacity === "" ? null : Number(capacity);
        const pointsNum = points === "" ? null : Number(points);

        if (capacityNum !== null && (isNaN(capacityNum) || capacityNum < 0)) next.capacity = "Must be a positive value";
        if (pointsNum !== null && (isNaN(pointsNum) || pointsNum < 0)) next.points = "Must be a positive value";

        const start = startTime ? new Date(startTime) : null;
        const end = endTime ? new Date(endTime) : null;
        const now = new Date();

        if (!start) next.startTime = "Start time is required";
        if (!end) next.endTime = "End time is required";
        if (start && start < now) next.startTime = "Cannot be in the past";
        if (start && end && end <= start) next.endTime = "Must be after start time";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await api.post("/events", {
                name: name.trim(),
                description: description.trim(),
                location: location.trim(),
                capacity: capacity === "" ? null : Number(capacity),
                pointsRemain: points === "" ? 0 : Number(points),
                pointsAwarded: 0,
                published: true,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });
            onCreated?.();
            onClose?.();
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to create event";
            setErrors({ form: msg });
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    ×
                </button>
                <h2 className={styles.title}>New Event</h2>
                {errors.form && <div className={styles.formError}>{errors.form}</div>}
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Event name"
                        />
                        {errors.name && <div className={styles.error}>{errors.name}</div>}
                    </div>
                    <div className={styles.field}>
                        <label>Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Room or venue"
                        />
                        {errors.location && <div className={styles.error}>{errors.location}</div>}
                    </div>

                    <div className={styles.field}>
                        <label>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description"
                        />
                        {errors.description && <div className={styles.error}>{errors.description}</div>}
                    </div>
                    <div className={styles.field}>
                        <label>Capacity</label>
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            min="0"
                            step="1"
                            placeholder="Optional"
                        />
                        {errors.capacity && <div className={styles.error}>{errors.capacity}</div>}
                    </div>

                    <div className={styles.field}>
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                        {errors.startTime && <div className={styles.error}>{errors.startTime}</div>}
                    </div>
                    <div className={styles.field}>
                        <label>Points</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            min="0"
                            step="1"
                            placeholder="Total points available"
                        />
                        {errors.points && <div className={styles.error}>{errors.points}</div>}
                    </div>

                    <div className={styles.field}>
                        <label>End Time</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                        {errors.endTime && <div className={styles.error}>{errors.endTime}</div>}
                    </div>
                </div>

                <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Creating..." : "Create New Event"}
                </button>
            </div>
        </div>
    );
}

export default NewEventPopup;
