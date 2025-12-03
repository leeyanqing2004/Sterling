import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import "./ManageTransactionPopup.css";

const formatDateTime = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

function DetailRow({ label, value }) {
    return (
        <div className="mtp-detail-row">
            <div className="mtp-detail-label">{label}</div>
            <div className="mtp-detail-value">{value ?? "--"}</div>
        </div>
    );
}

function ManageTransactionPopup({ show = true, onClose, transaction }) {
    const [step, setStep] = useState("view"); // view | adjust | success
    const [utorid, setUtorid] = useState("");
    const [amount, setAmount] = useState("");
    const [relatedId, setRelatedId] = useState("");
    const [remark, setRemark] = useState("");
    const [promotionIds, setPromotionIds] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [createdTx, setCreatedTx] = useState(null);
    const [toast, setToast] = useState(null);
    const [suspiciousSubmitting, setSuspiciousSubmitting] = useState(false);
    const [suspicious, setSuspicious] = useState(false);
    const [promoFormatError, setPromoFormatError] = useState("");

    const parsedPromotions = useMemo(() => {
        return promotionIds
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p !== "")
            .map((p) => Number(p))
            .filter((n) => Number.isInteger(n) && n > 0);
    }, [promotionIds]);

    useEffect(() => {
        if (!transaction) return;
        setUtorid(transaction.utorid || "");
        setRelatedId(transaction.id || "");
        setRemark("");
        setAmount(transaction.amount || "");
        setPromotionIds("");
        setSuspicious(Boolean(transaction.suspicious));
        setStep("view");
        setCreatedTx(null);
        setError("");
        setToast(null);
        setPromoFormatError("");
    }, [transaction]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2000);
        return () => clearTimeout(t);
    }, [toast]);

    if (!show || !transaction) return null;

    const handleClose = () => {
        onClose?.();
        setStep("view");
        setCreatedTx(null);
        setToast(null);
        setError("");
    };

    const toggleSuspicious = async () => {
        if (!transaction?.id) return;
        setSuspiciousSubmitting(true);
        try {
            await api.patch(`/transactions/${transaction.id}/suspicious`, {
                suspicious: !suspicious,
            });
            setSuspicious(!suspicious);
            setToast({ type: "success", message: "Suspicious flag updated" });
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.error || "Failed to update flag" });
        } finally {
            setSuspiciousSubmitting(false);
        }
    };

    const handleCreateAdjustment = async () => {
        setError("");
        setPromoFormatError("");
        const parsedAmount = Number(amount);
        const parsedRelated = Number(relatedId);
        const promoInput = promotionIds.trim();
        if (promoInput) {
            const tokens = promoInput
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);
            const invalid = tokens.some((t) => !/^\d+$/.test(t));
            if (invalid) {
                const msg = "Incorrect format (e.g. 12, 15, 16)";
                setPromoFormatError(msg);
                setToast({ type: "error", message: msg });
                return;
            }
        }

        if (!utorid.trim()) {
            setToast({ type: "error", message: "UTORid is required" });
            return;
        }
        if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
            setToast({ type: "error", message: "Amount must be a non-zero number" });
            return;
        }
        if (!Number.isInteger(parsedRelated) || parsedRelated <= 0) {
            setToast({ type: "error", message: "Related transaction ID must be a positive integer" });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                utorid: utorid.trim(),
                type: "adjustment",
                amount: parsedAmount,
                relatedId: parsedRelated,
                remark: remark.trim(),
            };
            if (parsedPromotions.length) {
                payload.promotionIds = parsedPromotions;
            }

            const res = await api.post("/transactions", payload);
            setCreatedTx(res.data);
            setStep("success");
            setToast({ type: "success", message: "Adjustment created" });
        } catch (err) {
            const msg = err?.response?.data?.error || err.message || "Failed to create adjustment";
            setToast({ type: "error", message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const renderHeader = (title) => (
        <div className="mtp-header">
            <div className="mtp-header-main">
                <div className="mtp-title">{title}</div>
                <button
                    className={`mtp-flag ${suspicious ? "active" : ""}`}
                    onClick={toggleSuspicious}
                    disabled={suspiciousSubmitting}
                    title="Toggle suspicious"
                >
                    ⚑
                </button>
            </div>
        </div>
    );

    const renderView = () => (
        <>
            {renderHeader("Transaction")}
            <div className="mtp-details">
                <DetailRow label="ID" value={transaction.id} />
                <DetailRow label="UTORid" value={transaction.utorid} />
                <DetailRow label="Amount" value={transaction.amount} />
                <DetailRow label="Type" value={transaction.type} />
                <DetailRow label="Created By" value={transaction.createdBy} />
                <DetailRow label="Remark" value={transaction.remark} />
                <DetailRow label="Promotions Applied" value={transaction.promotionIds?.join(", ") || "--"} />
                <DetailRow label="Suspicious" value={suspicious ? "Yes" : "No"} />
            </div>
            <button className="mtp-primary" onClick={() => setStep("adjust")}>
                Create Adjustment Transaction
            </button>
        </>
    );

    const renderAdjust = () => (
        <>
            {renderHeader("Adjustment")}
            <div className="mtp-field">
                <label htmlFor="mtp-amount">Adjustment Amount</label>
                <input
                    id="mtp-amount"
                    type="number"
                    placeholder="e.g. -300"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={submitting}
                />
            </div>
            <div className="mtp-field">
                <label htmlFor="mtp-promos">Promotions to apply</label>
                <input
                    id="mtp-promos"
                    type="text"
                    placeholder="e.g. 12, 15, 18"
                    value={promotionIds}
                    onChange={(e) => setPromotionIds(e.target.value)}
                    disabled={submitting}
                />
                {promoFormatError && <div className="mtp-hint error">{promoFormatError}</div>}
            </div>
            <div className="mtp-field mtp-remark-field">
                <label htmlFor="mtp-remark">Remarks</label>
                <textarea
                    id="mtp-remark"
                    rows="3"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    disabled={submitting}
                />
            </div>
            <button className={`mtp-primary ${submitting ? "loading" : ""}`} onClick={handleCreateAdjustment} disabled={submitting}>
                {submitting ? "Submitting..." : "Create Adjustment Transaction"}
            </button>
        </>
    );

    const renderSuccess = () => (
        <>
            {renderHeader("Adjustment Transaction")}
            <div className="mtp-details">
                <DetailRow label="id" value={createdTx?.id} />
                <DetailRow label="utorid" value={createdTx?.utorid} />
                <DetailRow label="amount" value={createdTx?.amount} />
                <DetailRow label="adjusted transaction id" value={createdTx?.relatedId} />
                <DetailRow label="remark" value={createdTx?.remark} />
                <DetailRow label="promotion IDs applied" value={createdTx?.promotionIds?.join(", ") || "--"} />
                <DetailRow label="created by" value={createdTx?.createdBy} />
            </div>
        </>
    );

    return (
        <div className="manage-transaction-popup">
            <div className="manage-transaction-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="manage-transaction-popup-close-button" onClick={handleClose}>
                    X
                </button>
                {step === "view" && renderView()}
                {step === "adjust" && renderAdjust()}
                {step === "success" && renderSuccess()}
            </div>
            {toast && (
                <div className={`mtp-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default ManageTransactionPopup;
