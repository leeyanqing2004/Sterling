import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
import "./RedeemPointsPopup.css";

function RedeemPointsPopup() {
    const { user } = useAuth();
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");

        const amountOfPoints = parseInt(amount);
        if (!amount || isNaN(amountOfPoints)) {
            setError("Please enter a valid amount of points!");
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
                points: amountOfPoints,
                remarks: remarks
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

    return <div className="redeem-points-popup-redemption-popup">
        <div className="redeem-points-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="redeem-points-popup-close-button">X</button>
            <h2 className="redeem-points-popup-title">Redeem Points</h2>
            <div className="redeem-points-popup-amount-of-points">
                <label 
                    className="redeem-points-popup-amount-of-points-label" 
                    htmlFor="redeem-points-popup-amount-of-points-input"
                >
                    Amount of Points</label>
                <input 
                    id="redeem-points-popup-amount-of-points-input"
                    type="number"
                    name="redeem-points-popup-amount-of-points-input"
                    placeholder="e.g. 1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={submitting}
                />
                {error && <span className="redeem-points-popup-error">{error}</span>}
            </div>
            <div className="redeem-points-popup-remarks">
                <label 
                    className="redeem-points-popup-remarks-label" 
                    htmlFor="redeem-points-popup-remarks-input"
                >
                    Remarks
                </label>
                <textarea 
                    id="redeem-points-popup-remarks-input"
                    name="redeem-points-popup-remarks-input"
                    placeholder="Enter any remarks here..."
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={submitting}
                />
            </div>

            <button 
                className="redeem-points-popup-submit-button"
                onClick={handleSubmit}
                disabled={submitting}
            >
                Request Redemption
            </button>
        </div>
    </div>
}

export default RedeemPointsPopup;