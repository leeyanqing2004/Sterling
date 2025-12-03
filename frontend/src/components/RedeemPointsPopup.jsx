import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
import styles from "./RedeemPointsPopup.module.css";

function RedeemPointsPopup({ show, setShow }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");

        const amountOfPoints = parseInt(amount);
        if (!amount || isNaN(amountOfPoints)) {
            setError("Please enter a valid number of points!");
            return;
        }

        if (amountOfPoints <= 0) {
            setError("Amount of points must be greater than zero!");
            return;
        }

        if (amountOfPoints > user.points) {
            setError("You do not have enough points!");
            return;
        }

        setSubmitting(true);

        try {
            await api.post("users/me/transactions", {
                type: "redemption",
                point: amountOfPoints,
                remark: remarks
            });

            setAmount("");
            setRemarks("");
            setError("");
            alert("Redemption request submitted successfully!");
        } catch (err) {
            setError(err.response?.data?.error)
        } finally {
            setSubmitting(false);
        }
    }; 

    return show && <div className={styles.redeemPointsPopupRedemptionPopup}>
        <div className={styles.redeemPointsPopupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.redeemPointsPopupCloseButton} onClick={() => setShow(false)}>X</button>
            <h2 className={styles.redeemPointsPopupTitle}>Redeem Points</h2>
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={submitting}
                />
                <span className={styles.redeemPointsPopupError}>{error}</span>
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
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={submitting}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                />
            </div>

            <button 
                className={styles.redeemPointsPopupSubmitButton}
                onClick={handleSubmit}
                disabled={submitting}
            >
                Request Redemption
            </button>
        </div>
    </div>
}

export default RedeemPointsPopup;