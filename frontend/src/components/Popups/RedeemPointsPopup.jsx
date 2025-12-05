import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import styles from "./RedeemPointsPopup.module.css";

function RedeemPointsPopup({ show = true, setShow, onClose }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [toast, setToast] = useState(null); // { message, type }

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleClose = () => {
        if (setShow) setShow(false);
        if (onClose) onClose();
    };

    const handleSubmit = async () => {
        setSuccess("");
        setError("");

        const amountOfPoints = parseInt(amount);
        if (!amount || isNaN(amountOfPoints)) {
            setToast({ message: "Please enter a valid number of points", type: "error" });
            return;
        }

        if (amountOfPoints <= 0) {
            setToast({ message: "Amount of points must be greater than zero", type: "error" });
            return;
        }

        if (amountOfPoints > user.points) {
            setToast({ message: "You do not have enough points", type: "error" });
            return;
        }

        setSubmitting(true);

        try {
            await api.post("/users/me/transactions", {
                type: "redemption",
                amount: amountOfPoints,
                remark: remarks.trim()
            });

            setAmount("");
            setRemarks("");
            setSuccess("Redemption request submitted");
            setToast({ message: "Redemption request submitted", type: "success" });
        } catch (err) {
            const message = err.response?.data?.error || "Failed to submit redemption";
            setToast({ message, type: "error" });
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }; 

    const handleReset = () => {
        setAmount("");
        setRemarks("");
        setError("");
        setSuccess("");
        setToast(null);
    };

    return show && <div className={styles.redeemPointsPopupRedemptionPopup}>
        <div className={styles.redeemPointsPopupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.redeemPointsPopupCloseButton} onClick={handleClose}>X</button>
            <h2 className={styles.redeemPointsPopupTitle}>Redeem Points</h2>
            {!success && (
                <>
                    <div className={styles.redeemPointsPopupAmountOfPoints}>
                        <label 
                            className={styles.redeemPointsPopupAmountOfPointsLabel} 
                            htmlFor="redeemPointsPopupAmountOfPointsInput"
                        >
                            Amount of Points</label>
                        <input 
                            id="redeemPointsPopupAmountOfPointsInput"
                            className={styles.redeemPointsPopupAmountOfPointsInput}
                            type="number"
                            name="redeemPointsPopupAmountOfPointsInput"
                            placeholder="e.g. 1000"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className={styles.redeemPointsPopupRemarks}>
                        <label 
                            className={styles.redeemPointsPopupRemarksLabel} 
                            htmlFor="redeemPointsPopupRemarksInput"
                        >
                            Remarks
                        </label>
                        <textarea 
                            id="redeemPointsPopupRemarksInput"
                            className={styles.redeemPointsPopupRemarksInput}
                            name="redeemPointsPopupRemarksInput"
                            placeholder="Enter any remarks here..."
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            disabled={submitting}
                        />
                    </div>
                </>
            )}

            <div className={styles.redeemPointsPopupMessage}>
                {!error && success && (
                    <div className={styles.redeemPointsPopupSuccessActions}>
                        <button className={styles.redeemPointsPopupSubmitButton} onClick={handleClose}>Close</button>
                        <button className={styles.redeemPointsPopupSubmitButton} onClick={handleReset}>Request another redemption</button>
                    </div>
                )}
            </div>

            {!success && (
                <button 
                    className={`${styles.redeemPointsPopupSubmitButton} ${submitting ? styles.loading : ""}`}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Request Redemption"}
                </button>
            )}
        </div>
        {toast && (
            <div
                className={`${styles.redeemPointsToastPopup} ${
                    toast.type === "error"
                        ? styles.redeemPointsToastError
                        : styles.redeemPointsToastSuccess
                }`}
            >
                {toast.message}
            </div>
        )}
    </div>
}

export default RedeemPointsPopup;
