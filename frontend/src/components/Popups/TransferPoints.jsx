import { useEffect, useState } from "react";
import api from "../../api/api";
import "./TransferPoints.css";

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

    return <div className="transfer-points-redemption-popup" onClick={onClose}>
        <div className="transfer-points-content" onClick={(e) => e.stopPropagation()}>
            <button className="transfer-points-close-button" onClick={onClose}>X</button>
            <h2 className="transfer-points-title">Transfer Points</h2>
            {!success && (
                <>
                    <div className="transfer-points-recipient">
                        <label 
                            className="transfer-points-recipient-label" 
                            htmlFor="transfer-points-recipient-input"
                        >
                            Recipient (UTORid)</label>
                        <input 
                            id="transfer-points-recipient-input"
                            type="text"
                            name="transfer-points-recipient-input"
                            placeholder="e.g. kabirsh7"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="transfer-points-amount-of-points">
                        <label 
                            className="transfer-points-amount-of-points-label" 
                            htmlFor="transfer-points-amount-of-points-input"
                        >
                            Amount of Points</label>
                        <input 
                            id="transfer-points-amount-of-points-input"
                            type="number"
                            name="transfer-points-amount-of-points-input"
                            placeholder="e.g. 1000"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="transfer-points-remarks">
                        <label 
                            className="transfer-points-remarks-label" 
                            htmlFor="transfer-points-remarks-input"
                        >
                            Remarks
                        </label>
                        <textarea 
                            id="transfer-points-remarks-input"
                            name="transfer-points-remarks-input"
                            placeholder="Enter any remarks here..."
                            rows="4"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                        />
                    </div>
                </>
            )}

            <div className="transfer-points-message">
                {!error && success && (
                    <div className="transfer-points-success-actions">
                        <button className="transfer-points-submit-button secondary" onClick={onClose}>Close</button>
                        <button className="transfer-points-submit-button" onClick={handleReset}>Make another transfer</button>
                    </div>
                )}
            </div>

            {!success && (
                <button 
                    className={`transfer-points-submit-button ${submitting ? "loading" : ""}`}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Confirm Transfer"}
                </button>
            )}
        </div>
        {toast && (
            <div className={`transfer-points-toast-popup ${toast.type}`}>
                {toast.message}
            </div>
        )}
    </div>
}

export default TransferPointsPopup;
