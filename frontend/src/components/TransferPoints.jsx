import { useEffect, useState } from "react";
import api from "../api/api";
import styles from "./TransferPoints.module.css";

function TransferPointsPopup({ onClose }) {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [remark, setRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [toast, setToast] = useState(null); // { message, type }

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleSubmit = async () => {
        setSuccess("");

        const trimmedRecipient = recipient.trim();
        const parsedAmount = Number(amount);

        if (!trimmedRecipient) {
            setError("Recipient UTORid is required");
            setToast({ message: "Recipient UTORid is required", type: "error" });
            return;
        }
        if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be a positive whole number");
            setToast({ message: "Amount must be a positive whole number", type: "error" });
            return;
        }

        setSubmitting(true);
        try {
            // UTORid to userId
            const lookupRes = await api.get(`/users/resolve/${encodeURIComponent(trimmedRecipient)}`);
            const receiverId = lookupRes?.data?.id;
            if (!receiverId) {
                throw new Error("Receiver not found.");
            }

            await api.post(`/users/${receiverId}/transactions`, {
                type: "transfer",
                amount: parsedAmount,
                remark: remark.trim()
            });
            setError("");
            setSuccess("Transfer successfully submitted");
            setToast({ message: "Transfer successfully submitted", type: "success" });
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || "Failed to submit transfer.";
            setError(message);
            setToast({ message, type: "error" });
            setSuccess("");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setRecipient("");
        setAmount("");
        setRemark("");
        setError("");
        setSuccess("");
    };

    return <div className={styles.transferPointsPopupRedemptionPopup} onClick={onClose}>
        <div className={styles.transferPointsPopupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.transferPointsPopupCloseButton} onClick={onClose}>X</button>
            <h2 className={styles.transferPointsPopupTitle}>Transfer Points</h2>
            {!success && (
                <>
                    <div className={styles.transferPointsPopupField}>
                        <label 
                            className={styles.transferPointsRecipientPopupLabel} 
                            htmlFor="transferPointsRecipientLabel"
                        >
                            Recipient (UTORid)</label>
                        <input 
                            id="transferPointsPopupRecipientInput"
                            type="text"
                            name="transferPointsPopupRecipientInput"
                            placeholder="e.g. kabirsh7"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className={styles.transferPointsPopupInput}
                        />
                    </div>
                    <div className={styles.transferPointsPopupField}>
                        <label 
                            className={styles.transferPointsPopupAmountOfPointsLabel} 
                            htmlFor="transferPointsPopupAmountOfPointsInput"
                        >
                            Amount of Points</label>
                        <input 
                            id="transferPointsPopupAmountOfPointsInput"
                            type="number"
                            name="transferPointsPopupAmountOfPointsInput"
                            placeholder="e.g. 1000"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={styles.transferPointsPopupInput}
                        />
                    </div>
                    <div className={styles.transferPointsPopupRemarksField}>
                        <label 
                            className={styles.transferPointsPopupRemarksLabel} 
                            htmlFor="transferPointsPopupRemarksInput"
                        >
                            Remarks
                        </label>
                        <textarea 
                            id="transferPointsPopupRemarksInput"
                            name="transferPointsPopupRemarksInput"
                            placeholder="Enter any remarks here..."
                            rows="4"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className={styles.transferPointsPopupTextarea}
                        />
                    </div>
                </>
            )}

            <div className={styles.transferPointsPopupMessage}>
                {!error && success && (
                    <div className={styles.transferPointsPopupSuccessActions}>
                        <button className={`${styles.transferPointsPopupSubmitButton} ${styles.secondary}`} onClick={onClose}>Close</button>
                        <button className={styles.transferPointsPopupSubmitButton} onClick={handleReset}>Make another transfer</button>
                    </div>
                )}
            </div>

            {!success && (
                <button 
                    className={`${styles.transferPointsPopupSubmitButton} ${submitting ? styles.loading : ""}`}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Confirm Transfer"}
                </button>
            )}
        </div>
        {toast && (
            <div className={`${styles.transferPointsToastPopup} ${toast.type === "error" ? styles.transferPointsToastError : styles.transferPointsToastSuccess}`}>
                {toast.message}
            </div>
        )}
    </div>
}

export default TransferPointsPopup;
