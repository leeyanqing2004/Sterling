import { useState, useEffect } from "react";
import styles from "./NewPromotionPopup.module.css";
import api from "../api/api";

const typeOptions = [
    { value: "automatic", label: "Automatic" },
    { value: "one-time", label: "One-time" },
];

function NewPromotionPopup({ show = false, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("automatic");
    const [minSpending, setMinSpending] = useState("");
    const [rate, setRate] = useState("");
    const [points, setPoints] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!show) {
            setName("");
            setDescription("");
            setType("automatic");
            setMinSpending("");
            setRate("");
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
        if (!description.trim()) next.description = "Description is required";
        if (!type) next.type = "Type is required";

        const minSpendNum = minSpending === "" ? null : Number(minSpending);
        const rateNum = rate === "" ? null : Number(rate);
        const pointsNum = points === "" ? null : Number(points);

        if (minSpendNum !== null && (isNaN(minSpendNum) || minSpendNum < 0)) next.minSpending = "Must be a positive value";
        if (rateNum !== null && (isNaN(rateNum) || rateNum < 0)) next.rate = "Must be a positive value";
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
            await api.post("/promotions", {
                name: name.trim(),
                description: description.trim(),
                type,
                minSpending: minSpending === "" ? null : Number(minSpending),
                rate: rate === "" ? null : Number(rate),
                points: points === "" ? null : Number(points),
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });
            onCreated?.();
            onClose?.();
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to create promotion";
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
                <h2 className={styles.title}>New Promotion</h2>
                {errors.form && <div className={styles.formError}>{errors.form}</div>}
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Promotion name"
                        />
                        {errors.name && <div className={styles.error}>{errors.name}</div>}
                    </div>
                    <div className={styles.field}>
                        <label>Promotions Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            {typeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors.type && <div className={styles.error}>{errors.type}</div>}
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
                        <label>Minimum Spending</label>
                        <input
                            type="number"
                            value={minSpending}
                            onChange={(e) => setMinSpending(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                        />
                        {errors.minSpending && <div className={styles.error}>{errors.minSpending}</div>}
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
                        <label>Rate</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                        />
                        {errors.rate && <div className={styles.error}>{errors.rate}</div>}
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
                    <div className={styles.field}>
                        <label>Points</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            min="0"
                            step="1"
                            placeholder="Optional"
                        />
                        {errors.points && <div className={styles.error}>{errors.points}</div>}
                    </div>
                </div>

                <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Creating..." : "Create New Promotion"}
                </button>
            </div>
        </div>
    );
}

export default NewPromotionPopup;
