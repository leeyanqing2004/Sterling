import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import styles from "./NewPromotionPopup.module.css";

const typeOptions = [
    { value: "automatic", label: "Automatic" },
    { value: "one-time", label: "One-time" },
];

const toLocalInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};

function ManagePromotionPopup({ show = false, onClose, promotion, onPromotionUpdate }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "automatic",
        startTime: "",
        endTime: "",
        minSpending: "",
        rate: "",
        points: ""
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [toast, setToast] = useState(null);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        if (!promotion?.id) return;
        const fetchDetail = async () => {
            setLoading(true);
            setLoadError("");
            try {
                const res = await api.get(`/promotions/${promotion.id}`);
                const p = res.data || {};
                setForm({
                    name: p.name || "",
                    description: p.description || "",
                    type: p.type || "automatic",
                    startTime: toLocalInput(p.startTime),
                    endTime: toLocalInput(p.endTime),
                    minSpending: p.minSpending ?? "",
                    rate: p.rate ?? "",
                    points: p.points ?? ""
                });
                setErrors({});
                setSubmitting(false);
            } catch (err) {
                const msg = err.response?.data?.error || "Failed to load promotion";
                setLoadError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [promotion?.id]);

    const changedPayload = useMemo(() => {
        if (!promotion) return {};
        const payload = {};
        if (form.name !== promotion.name) payload.name = form.name;
        if (form.description !== promotion.description) payload.description = form.description;
        if (form.type !== promotion.type) payload.type = form.type;
        if (form.startTime && toLocalInput(promotion.startTime) !== form.startTime) {
            payload.startTime = new Date(form.startTime).toISOString();
        }
        if (form.endTime && toLocalInput(promotion.endTime) !== form.endTime) {
            payload.endTime = new Date(form.endTime).toISOString();
        }
        const minSpendNum = form.minSpending === "" ? null : Number(form.minSpending);
        if (minSpendNum !== promotion.minSpending && form.minSpending !== "") {
            payload.minSpending = minSpendNum;
        }
        const rateNum = form.rate === "" ? null : Number(form.rate);
        if (rateNum !== promotion.rate && form.rate !== "") {
            payload.rate = rateNum;
        }
        const pointsNum = form.points === "" ? null : Number(form.points);
        if (pointsNum !== promotion.points && form.points !== "") {
            payload.points = pointsNum;
        }
        return payload;
    }, [form, promotion]);

    const validate = () => {
        const next = {};
        const now = new Date();
        const start = form.startTime ? new Date(form.startTime) : null;
        const end = form.endTime ? new Date(form.endTime) : null;

        if (start && start < now) next.startTime = "Start time cannot be in the past";
        if (end && end < now) next.endTime = "End time cannot be in the past";
        if (start && end && end <= start) next.endTime = "End must be after start";

        const minSpendNum = form.minSpending === "" ? null : Number(form.minSpending);
        const rateNum = form.rate === "" ? null : Number(form.rate);
        const pointsNum = form.points === "" ? null : Number(form.points);
        if (minSpendNum !== null && (isNaN(minSpendNum) || minSpendNum < 0)) next.minSpending = "Must be positive";
        if (rateNum !== null && (isNaN(rateNum) || rateNum < 0)) next.rate = "Must be positive";
        if (pointsNum !== null && (isNaN(pointsNum) || pointsNum < 0)) next.points = "Must be positive";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!promotion) return;
        if (!validate()) return;
        if (Object.keys(changedPayload).length === 0) {
            onClose?.();
            return;
        }
        setSubmitting(true);
        try {
            const res = await api.patch(`/promotions/${promotion.id}`, changedPayload);
            const updated = { ...promotion, ...res.data };
            onPromotionUpdate?.(updated);
            setToast({ type: "success", message: "Promotion updated" });
            setClosing(true);
            setTimeout(() => {
                onClose?.();
                setClosing(false);
            }, 3200);
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to update promotion";
            setErrors({ form: msg });
            setToast({ type: "error", message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const showOverlay = show && promotion && !closing;
    if (!showOverlay && !toast) return null;

    const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <>
            {showOverlay && (
                <div className={styles.overlay} onClick={onClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                            ×
                        </button>
                        <h2 className={styles.title}>Manage Promotion #{promotion.id}</h2>
                        {(errors.form || loadError) && (
                            <div className={styles.formError}>{errors.form || loadError}</div>
                        )}
                        {loading ? (
                            <div className={styles.tableLoading} style={{ padding: "8px 0", justifyContent: "flex-start" }}>
                                <div className={styles.spinner} />
                                <span>Loading promotion...</span>
                            </div>
                        ) : (
                            <>
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label>Name</label>
                                        <input type="text" value={form.name} onChange={setField("name")} />
                                        {errors.name && <div className={styles.error}>{errors.name}</div>}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Promotions Type</label>
                                        <select value={form.type} onChange={setField("type")}>
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
                                        <input type="text" value={form.description} onChange={setField("description")} />
                                        {errors.description && <div className={styles.error}>{errors.description}</div>}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Minimum Spending</label>
                                        <input
                                            type="number"
                                            value={form.minSpending}
                                            onChange={setField("minSpending")}
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.minSpending && <div className={styles.error}>{errors.minSpending}</div>}
                                    </div>

                                    <div className={styles.field}>
                                        <label>Start Time</label>
                                        <input type="datetime-local" value={form.startTime} onChange={setField("startTime")} />
                                        {errors.startTime && <div className={styles.error}>{errors.startTime}</div>}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Rate</label>
                                        <input type="number" value={form.rate} onChange={setField("rate")} min="0" step="0.01" />
                                        {errors.rate && <div className={styles.error}>{errors.rate}</div>}
                                    </div>

                                    <div className={styles.field}>
                                        <label>End Time</label>
                                        <input type="datetime-local" value={form.endTime} onChange={setField("endTime")} />
                                        {errors.endTime && <div className={styles.error}>{errors.endTime}</div>}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Points</label>
                                        <input type="number" value={form.points} onChange={setField("points")} min="0" step="1" />
                                        {errors.points && <div className={styles.error}>{errors.points}</div>}
                                    </div>
                                </div>

                                <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting || loading}>
                                    {submitting ? "Updating..." : "Update Promotion"}
                                </button>
                            </>
                        )}
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

export default ManagePromotionPopup;


