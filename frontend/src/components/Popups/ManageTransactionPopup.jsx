import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import "./ManageTransactionPopup.css";
import { Capitalize } from "../../utils/capitalize";

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

function ManageTransactionPopup({ show = true, onClose, transaction, onTransactionUpdate }) {
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
    const [currentTransaction, setCurrentTransaction] = useState(transaction);

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
        setCurrentTransaction(transaction);
        setUtorid(transaction.utorid || "");
        setRelatedId(transaction.id || "");
        setRemark("");
        setAmount("");
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
        setSubmitting(true);
        setError("");
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount)) {
            setError("Please enter a valid adjustment amount.");
            setSubmitting(false);
            return;
        }
        try {
            const payload = {
                utorid,
                type: "adjustment",
                amount: numericAmount,
                relatedId: transaction.id,
                remark,
                promotionIds: parsedPromotions,
            };

            const response = await api.post("/transactions", payload);
            setCreatedTx(response.data);

            const updatedTx = response.data?.updatedTransaction
                ? { ...transaction, ...response.data.updatedTransaction }
                : transaction;

            if (updatedTx && onTransactionUpdate) {
                onTransactionUpdate(updatedTx);
            }
            setCurrentTransaction(updatedTx);
            setStep("success");
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || "Failed to create adjustment";
            setError(message);
            setToast({ message, type: "error" });
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

    const renderView = () => {
        const tx = currentTransaction || transaction;
        return (
            <>
                {renderHeader("Transaction")}
                <div className="mtp-details">
                    <DetailRow label="ID" value={tx.id} />
                    <DetailRow label="UTORid" value={tx.utorid} />
                    <DetailRow label="Amount" value={tx.amount} />
                    <DetailRow label="Type" value={Capitalize(tx.type)} />
                    <DetailRow label="Created By" value={tx.createdBy} />
                    <DetailRow label="Remark" value={tx.remark} />
                    <DetailRow label="Promotions Applied" value={tx.promotionIds?.join(", ") || "—"} />
                    <DetailRow label="Suspicious" value={suspicious ? "Yes" : "No"} />
                </div>
                <button className="mtp-primary" onClick={() => setStep("adjust")}>
                    Create Adjustment Transaction
                </button>
            </>
        );
    };

    const renderAdjust = () => {
        const tx = currentTransaction || transaction;
        const currentAmount = tx.amount || 0;
        const adjustmentAmount = Number(amount) || 0;
        const newAmount = currentAmount + adjustmentAmount;
        
        return (
            <>
                {renderHeader("Adjustment")}
                <div className="mtp-details">
                    <DetailRow label="Transaction ID" value={tx.id} />
                    <DetailRow label="Current Amount" value={currentAmount} />
                </div>
                <div className="mtp-field">
                    <label htmlFor="mtp-amount">Adjustment Amount</label>
                    <input
                        id="mtp-amount"
                        type="number"
                        placeholder="e.g. -50"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={submitting}
                    />
                    {adjustmentAmount !== 0 && (
                        <div className="mtp-hint" style={{ color: adjustmentAmount < 0 ? "#d32f2f" : "#2e7d32" }}>
                            New amount will be: {newAmount}
                        </div>
                    )}
                </div>
                <div className="mtp-field">
                    <label htmlFor="mtp-promos">Promotions to apply</label>
                    <input
                        id="mtp-promos"
                        type="text"
                        placeholder="e.g. 12, 15, 18 (optional)"
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
                        placeholder="Optional"
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
    };

    const renderSuccess = () => {
        // Always show the adjustment transaction that was created
        if (!createdTx) return null;
        const successTx = createdTx;
        return (
            <div className="mtp-success-card">
                <button className="manage-transaction-popup-close-button" onClick={handleClose} aria-label="Close">×</button>
                <div className="mtp-success-title">Adjustment Transaction successfully created.</div>
                <div className="mtp-success-details">
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">id</span>
                        <span className="mtp-success-value">{successTx.id}</span>
                    </div>
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">UTORid</span>
                        <span className="mtp-success-value">{successTx.utorid}</span>
                    </div>
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">Amount</span>
                        <span className="mtp-success-value">{successTx.amount}</span>
                    </div>
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">Adjusted Transaction Id</span>
                        <span className="mtp-success-value">{successTx.relatedId}</span>
                    </div>
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">remark</span>
                        <span className="mtp-success-value">{successTx.remark || "--"}</span>
                    </div>
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">Promotions IDs Applied</span>
                        <span className="mtp-success-value">
                            {successTx.promotionIds?.length ? successTx.promotionIds.join(", ") : "--"}
                        </span>
                    </div>
                    <div className="mtp-success-row">
                        <span className="mtp-success-label">Created By</span>
                        <span className="mtp-success-value">{successTx.createdBy}</span>
                    </div>
                </div>
                {createdTx?.updatedTransaction && (
                    <div className="mtp-success-updated">
                        <div className="mtp-success-updated-title">Updated Transaction</div>
                        <div className="mtp-success-row">
                            <span className="mtp-success-label">ID</span>
                            <span className="mtp-success-value">{createdTx.updatedTransaction.id}</span>
                        </div>
                        <div className="mtp-success-row">
                            <span className="mtp-success-label">New Amount</span>
                            <span className="mtp-success-value">{createdTx.updatedTransaction.amount}</span>
                        </div>
                        {createdTx.updatedTransaction.earned !== undefined && (
                            <div className="mtp-success-row">
                                <span className="mtp-success-label">New Earned</span>
                                <span className="mtp-success-value">{createdTx.updatedTransaction.earned}</span>
                            </div>
                        )}
                        <div className="mtp-success-row">
                            <span className="mtp-success-label">Type</span>
                            <span className="mtp-success-value">{Capitalize(createdTx.updatedTransaction.type)}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const containerClass =
        step === "success"
            ? "manage-transaction-popup-content mtp-success-container"
            : "manage-transaction-popup-content";

    return (
        <div className="manage-transaction-popup" onClick={handleClose}>
            <div className={containerClass} onClick={(e) => e.stopPropagation()}>
                {step !== "success" && (
                    <button className="manage-transaction-popup-close-button" onClick={handleClose} aria-label="Close">×</button>
                )}
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














