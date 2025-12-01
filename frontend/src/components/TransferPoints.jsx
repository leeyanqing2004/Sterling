import "./TransferPoints.css";

function TransferPointsPopup({ onClose }) {
    return <div className="transfer-points-redemption-popup">
        <div className="transfer-points-content">
            <button className="transfer-points-close-button" onClick={onClose}>X</button>
            <h2 className="transfer-points-title">Transfer Points</h2>
            <div className="transfer-points-recipient">
                <label 
                    className="transfer-points-recipient-label" 
                    htmlFor="transfer-points-recipient-input"
                >
                    Recipient</label>
                <input 
                    id="transfer-points-recipient-input"
                    type="text"
                    name="transfer-points-recipient-input"
                    placeholder="e.g. kabirsh7"
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
                />
            </div>

            <button className="transfer-points-submit-button">Request Transfer</button>
        </div>
    </div>
}

export default TransferPointsPopup;
