import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
import styles from "./OrganizerManageEvent.module.css";
import NewGuestPopup from "../components/NewGuestPopup";
import AwardPointsPopup from "../components/Popups/AwardPointsPopup";

export default function OrganizerManageEvent() {
    const { id: eventIdParam } = useParams();
    const eventId = eventIdParam;
    const navigate = useNavigate();
    const { user } = useAuth();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    // Editable by organizer
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [capacity, setCapacity] = useState("");

    // View-only fields
    const [pointsRemain, setPointsRemain] = useState("");
    const [pointsAwarded, setPointsAwarded] = useState("");
    const [published, setPublished] = useState(false);

    // Lists
    const [organizers, setOrganizers] = useState([]);
    const [guestsOriginal, setGuestsOriginal] = useState([]);
    const [guestsDraft, setGuestsDraft] = useState([]);

    // Award points UI
    const [showAward, setShowAward] = useState(false);
    const [awardMode, setAwardMode] = useState("single"); // 'single' | 'all'
    const [awardUtorid, setAwardUtorid] = useState("");
    const [awardAmount, setAwardAmount] = useState("");
    const [awardRemark, setAwardRemark] = useState("");
    const [confirmAllOpen, setConfirmAllOpen] = useState(false);
    const [confirmSingleOpen, setConfirmSingleOpen] = useState(false);
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [pendingAwards, setPendingAwards] = useState([]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const loadEvent = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/events/${eventId}`);
            const ev = res.data;
            setName(ev.name || "");
            setDescription(ev.description || "");
            setLocation(ev.location || "");
            const fmt = (d) => {
                if (!d) return "";
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return "";
                const pad = (n) => String(n).padStart(2, "0");
                const yyyy = dt.getFullYear();
                const MM = pad(dt.getMonth() + 1);
                const dd = pad(dt.getDate());
                const HH = pad(dt.getHours());
                const mm = pad(dt.getMinutes());
                const ss = pad(dt.getSeconds());
                return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
            };
            setStartTime(fmt(ev.startTime));
            setEndTime(fmt(ev.endTime));
            setCapacity(ev.capacity ?? "");
            setPointsRemain(ev.pointsRemain ?? "");
            setPointsAwarded(ev.pointsAwarded ?? "");
            setPublished(Boolean(ev.published));
            setOrganizers(ev.organizers || []);
            const g = ev.guests || [];
            setGuestsOriginal(g);
            setGuestsDraft(g);
        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: "Failed to load event" });
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => { loadEvent(); }, [loadEvent]);

    const validateForm = () => {
        const errs = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!location.trim()) errs.location = "Location is required";
        if (!startTime) errs.startTime = "Start time is required";
        if (!endTime) errs.endTime = "End time is required";
        // capacity optional; if provided, must be non-negative integer
        if (capacity !== "" && Number.isNaN(Number(capacity))) errs.capacity = "Capacity must be a number";
        return errs;
    };

    const [errors, setErrors] = useState({});

    const handleSave = async () => {
        const v = validateForm();
        setErrors(v);
        if (Object.keys(v).length) {
            setToast({ type: "error", message: "Please fix the highlighted fields." });
            return;
        }
        setSubmitting(true);
        try {
            const updateData = {};
            if (name) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (location) updateData.location = location;
            if (startTime) updateData.startTime = new Date(startTime.replace(' ', 'T')).toISOString();
            if (endTime) updateData.endTime = new Date(endTime.replace(' ', 'T')).toISOString();
            if (capacity !== "") updateData.capacity = capacity ? parseInt(capacity, 10) : null;
            await api.patch(`/events/${eventId}`, updateData);
            setSubmitting(false);
            const originalUtorids = new Set(guestsOriginal.map(g => g.utorid));
            for (const g of guestsDraft) {
                if (!originalUtorids.has(g.utorid)) {
                    try {
                        await api.post(`/events/${eventId}/guests`, { utorid: g.utorid });
                    } catch (e) {
                        setToast({ type: "error", message: e.response?.data?.error || `Failed to add guest ${g.utorid}` });
                    }
                }
            }

            // Apply deferred awards via transactions endpoint
            for (const aw of pendingAwards) {
                try {
                    const payload = aw.type === "single"
                        ? { type: "event", utorid: aw.utorid, amount: aw.amount, remark: aw.remark }
                        : { type: "event", amount: aw.amount, remark: aw.remark };
                    await api.post(`/events/${eventId}/transactions`, payload);
                } catch (e) {
                    setToast({ type: "error", message: e.response?.data?.error || "Failed to award points" });
                }
            }

            setToast({ type: "success", message: "Changes saved" });
            loadEvent();
        } catch (err) {
            setToast({ type: "error", message: err.response?.data?.error || err.message || "Failed to save changes" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!isManagerOrSuperuser) return; // organizers cannot delete
        try {
            await api.delete(`/events/${eventId}`);
            setToast({ type: "success", message: "Event deleted" });
            navigate("/published-events");
        } catch (err) {
            console.error(err);
            setToast({ type: "error", message: err.response?.data?.error || "Failed to delete event" });
        }
    };

    const handleAddGuestDraft = (utorid) => {
        const exists = guestsDraft.some(g => g.utorid === utorid);
        if (exists) {
            setToast({ type: "error", message: "Guest already in list" });
            return;
        }
        setGuestsDraft(prev => [...prev, { id: `draft-${Date.now()}`, utorid }]);
        setToast({ type: "success", message: "Guest queued. Save to apply." });
    };

    // No delete guest and no add organizer in this view

    const openAwardPoints = () => setShowAward(true);
    const closeAwardPoints = () => setShowAward(false);

    const insufficientPoints = () => {
        const remain = Number(pointsRemain) || 0;
        const amt = Number(awardAmount) || 0;
        return amt > remain;
    };

    const doAwardSingle = async () => {
        try {
            await api.post(`/events/${eventId}/transactions`, {
                type: "event",
                utorid: awardUtorid,
                amount: Number(awardAmount),
                remark: awardRemark,
            });
            setToast({ type: "success", message: "Points awarded to guest" });
            closeAwardPoints();
            loadEvent();
        } catch (e) {
            setToast({ type: "error", message: e.response?.data?.error || "Failed to award points" });
        }
    };

    const doAwardAll = async () => {
        try {
            await api.post(`/events/${eventId}/transactions`, {
                type: "event",
                amount: Number(awardAmount),
                remark: awardRemark,
            });
            setToast({ type: "success", message: "Points awarded to all guests" });
            closeAwardPoints();
            loadEvent();
        } catch (e) {
            setToast({ type: "error", message: e.response?.data?.error || "Failed to award points" });
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner} />
                <span>Loading event...</span>
            </div>
        );
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.contentCard}>
                    <h1 className={styles.title}>Organizer Edit Event #{eventId}</h1>
                    {toast && (
                        <div
                            className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}
                            style={{ position: "relative", zIndex: 1000, marginTop: 8 }}
                        >
                            {toast.message}
                        </div>
                    )}
                    <div className={styles.formGrid}>
                        <div className={styles.formColumn}>
                            <div className={styles.formField}>
                                <label>Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} />
                                {errors.name && <div className={styles.error}>{errors.name}</div>}
                            </div>

                            <div className={styles.formField}>
                                <label>Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>

                            <div className={styles.formField}>
                                <label>Start Time</label>
                                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                {errors.startTime && <div className={styles.error}>{errors.startTime}</div>}
                            </div>

                            <div className={styles.formField}>
                                <label>End Time</label>
                                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                {errors.endTime && <div className={styles.error}>{errors.endTime}</div>}
                            </div>
                        </div>

                        <div className={styles.formColumn}>
                            <div className={styles.formField}>
                                <label>Location</label>
                                <input value={location} onChange={(e) => setLocation(e.target.value)} />
                                {errors.location && <div className={styles.error}>{errors.location}</div>}
                            </div>

                            <div className={styles.formField}>
                                <label>Capacity</label>
                                <input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                                {errors.capacity && <div className={styles.error}>{errors.capacity}</div>}
                            </div>

                            <div className={styles.formField}>
                                <label>Points Remain</label>
                                <input value={pointsRemain} readOnly />
                            </div>

                            <div className={styles.formField}>
                                <label>Points Awarded</label>
                                <input value={pointsAwarded} readOnly />
                            </div>

                            <div className={styles.formField}>
                                <label>Published</label>
                                <div>{published ? "Yes" : "No"}</div>
                            </div>
                        </div>

                        <div className={styles.formColumn}>
                            <div className={styles.formField}>
                                <label>Organizers</label>
                                <div className={styles.list}>
                                    {organizers.map((o) => (
                                        <div key={o.id} className={styles.listItem}>{o.utorid}</div>
                                    ))}
                                    {organizers.length === 0 && (
                                        <div className={styles.emptyList}>No organizers</div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formField}>
                                <label>Guests</label>
                                <div className={styles.sectionHeader}>
                                    <button className={styles.addButton} onClick={() => setShowGuestPopup(true)}>+ Add Guest</button>
                                </div>
                                <div className={styles.list}>
                                    {guestsDraft.map((g) => (
                                        <div key={g.id} className={styles.listItem}>{g.utorid}</div>
                                    ))}
                                    {guestsDraft.length === 0 && (
                                        <div className={styles.emptyList}>No guests</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <div className={styles.sectionHeader}>
                            <button className={styles.panelActionBtn} onClick={openAwardPoints}>Award Points</button>
                        </div>
                        {isManagerOrSuperuser && (
                            <button className={styles.deleteButton} onClick={handleDeleteEvent}>🗑 Delete Event</button>
                        )}
                        <button className={styles.saveButton} onClick={handleSave} disabled={submitting}>
                            {submitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <AwardPointsPopup
                show={showAward}
                pointsRemain={pointsRemain}
                awardMode={awardMode}
                awardUtorid={awardUtorid}
                awardAmount={awardAmount}
                awardRemark={awardRemark}
                setAwardMode={setAwardMode}
                setAwardUtorid={setAwardUtorid}
                setAwardAmount={setAwardAmount}
                setAwardRemark={setAwardRemark}
                insufficientPoints={insufficientPoints}
                onCancel={closeAwardPoints}
                onConfirmSingle={doAwardSingle}
                onConfirmAll={doAwardAll}
                confirmSingleOpen={confirmSingleOpen}
                confirmAllOpen={confirmAllOpen}
                setConfirmSingleOpen={setConfirmSingleOpen}
                setConfirmAllOpen={setConfirmAllOpen}
            />

            {/* Toast now rendered near title for visibility */}

            {showGuestPopup && (
                <NewGuestPopup
                    eventId={eventId}
                    draftMode={true}
                    onClose={() => setShowGuestPopup(false)}
                    onSuccess={(utorid) => { setShowGuestPopup(false); handleAddGuestDraft(utorid); }}
                />
            )}
        </>
    );
}