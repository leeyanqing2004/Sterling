import "./RedeemPoints.css";

function RedeemPointsPopup() {
    return <div className="redeem-points-redemption-popup">
        <div className="redeem-points-content">
            <button className="redeem-points-close-button">X</button>
            <h2 className="redeem-points-title">Redeem Points</h2>
            <div className="redeem-points-amount-of-points">
                <label 
                    className="redeem-points-amount-of-points-label" 
                    htmlFor="redeem-points-amount-of-points-input"
                >
                    Amount of Points</label>
                <input 
                    id="redeem-points-amount-of-points-input"
                    type="number"
                    name="redeem-points-amount-of-points-input"
                    placeholder="e.g. 1000"
                />
            </div>
            <div className="redeem-points-remarks">
                <label 
                    className="redeem-points-remarks-label" 
                    htmlFor="redeem-points-remarks-input"
                >
                    Remarks
                </label>
                <textarea 
                    id="redeem-points-remarks-input"
                    name="redeem-points-remarks-input"
                    placeholder="Enter any remarks here..."
                    rows="4"
                />
            </div>

            <button className="redeem-points-submit-button">Request Redemption</button>
        </div>
    </div>
}

export default RedeemPointsPopup;