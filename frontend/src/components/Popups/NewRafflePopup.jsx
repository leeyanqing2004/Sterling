import { useState, useEffect } from "react";
import styles from "./NewPromotionPopup.module.css";
import api from "../../api/api";

function NewRafflePopup({ show = false, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [pointCost, setPointCost] = useState("");
    const [prizePoints, setPrizePoints] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [drawTime, setDrawTime] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        if (!show) {
            setName("");
            setDescription("");
            setPointCost("");
            setPrizePoints("");
            setStartTime("");
            setEndTime("");
            setDrawTime("");
            setErrors({});
            setSubmitting(false);
        }
    }, [show]);

    const validate = () => {
        const next = {};
        if (!name.trim()) next.name = "Name is required";
        if (!description.trim()) next.description = "Description is required";

        const pointCostNum = pointCost === "" ? null : Number(pointCost);
        if (!pointCostNum || pointCostNum <= 0 || !Number.isInteger(pointCostNum)) {
            next.pointCost = "Must be a positive integer";
        }

        const prizePointsNum = prizePoints === "" ? null : Number(prizePoints);
        if (!prizePointsNum || prizePointsNum <= 0 || !Number.isInteger(prizePointsNum)) {
            next.prizePoints = "Must be a positive integer";
        }

        const start = startTime ? new Date(startTime) : null;
        const end = endTime ? new Date(endTime) : null;
        const draw = drawTime ? new Date(drawTime) : null;
        const now = new Date();

        if (!start) next.startTime = "Start time is required";
        if (!end) next.endTime = "End time is required";
        if (!draw) next.drawTime = "Draw time is required";
        if (start && start < now) next.startTime = "Cannot be in the past";
        if (start && end && end <= start) next.endTime = "Must be after start time";
        if (end && draw && draw <= end) next.drawTime = "Must be after end time";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await api.post("/raffles", {
                name: name.trim(),
                description: description.trim(),
                pointCost: Number(pointCost),
                prizePoints: Number(prizePoints),
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                drawTime: new Date(drawTime).toISOString(),
            });
            onCreated?.();
            setToast({ type: "success", message: "Raffle created" });
            setClosing(true);
            setTimeout(() => {
                onClose?.();
                setClosing(false);
            }, 3200);
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to create raffle";
            setErrors({ form: msg });
            setToast({ type: "error", message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const showOverlay = show && !closing;
    if (!showOverlay && !toast) return null;

    return (
        <>
            {showOverlay && (
                <div className={styles.overlay} onClick={onClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                            ×
                        </button>
                        <h2 className={styles.title}>New Raffle</h2>
                        {errors.form && <div className={styles.formError}>{errors.form}</div>}
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Raffle name"
                                />
                                {errors.name && <div className={styles.error}>{errors.name}</div>}
                            </div>
                            <div className={styles.field}>
                                <label>Point Cost</label>
                                <input
                                    type="number"
                                    value={pointCost}
                                    onChange={(e) => setPointCost(e.target.value)}
                                    min="1"
                                    step="1"
                                    placeholder="Points required to enter"
                                />
                                {errors.pointCost && <div className={styles.error}>{errors.pointCost}</div>}
                            </div>
                            <div className={styles.field}>
                                <label>Prize Points</label>
                                <input
                                    type="number"
                                    value={prizePoints}
                                    onChange={(e) => setPrizePoints(e.target.value)}
                                    min="1"
                                    step="1"
                                    placeholder="Points awarded to winner"
                                />
                                {errors.prizePoints && <div className={styles.error}>{errors.prizePoints}</div>}
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
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                                {errors.startTime && <div className={styles.error}>{errors.startTime}</div>}
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
                                <label>Draw Time</label>
                                <input
                                    type="datetime-local"
                                    value={drawTime}
                                    onChange={(e) => setDrawTime(e.target.value)}
                                />
                                {errors.drawTime && <div className={styles.error}>{errors.drawTime}</div>}
                            </div>
                        </div>

                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Creating..." : "Create New Raffle"}
                        </button>
                    </div>
                </div>
            )}
            {toast && (
                <div
                    className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
                >
                    {toast.message}
                </div>
            )}
        </>
    );
}

export default NewRafflePopup;

