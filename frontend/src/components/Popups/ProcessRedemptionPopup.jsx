import { useState } from "react";
import DetailsPopup from "./DetailsPopup";
import PopupFormField from "./PopupFormField";
import { getRedeemableById, processRedemption } from "../../api/getTransactionsApi";
import SuccessInfoPopup from "./SuccessInfoPopup";

export default function ProcessRedemptionPopup({ onClose, onSuccess }) {
    const [txId, setTxId] = useState("");
    const [lookup, setLookup] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleSearch = async () => {
        setError("");
        setSuccess(null);
        setLookup(null);
        if (!txId.trim()) {
            setError("Enter a transaction ID.");
            return;
        }
        try {
            setLoading(true);
            const data = await getRedeemableById(txId.trim());
            setLookup(data);
        } catch (e) {
            setError(e?.response?.data?.error || "Transaction not found");
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        if (!lookup || !lookup.id) return;
        setError("");
        try {
            setLoading(true);
            const res = await processRedemption(lookup.id);
            const payload = {
                title: "Redemption Processed",
                lines: [
                    `UTORid: ${res.utorid}`,
                    `Points deducted: ${res.redeemed}`,
                    `Processed by: ${res.processedBy || "n/a"}`,
                    res.remark ? `Remark: ${res.remark}` : null,
                ].filter(Boolean),
            };
            setSuccess(payload);
            if (onSuccess) onSuccess(payload);
            // auto-close the original popup after success
            onClose();
            // update card with processed state
            setLookup({ ...lookup, processed: true });
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to process redemption");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DetailsPopup onClose={onClose} title="Process Redemption">
            <div className="popup-form">
                <PopupFormField
                    label="Transaction ID"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="e.g. 234"
                />
                <button
                    className="action-btn"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Search
                </button>

                {error && <div className="popup-error">{error}</div>}

                {lookup && (
                    <div style={{ background: "#f6f8fb", borderRadius: 12, padding: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                            <div>
                                <div className="info-label">ID</div>
                                <div className="info-value">{lookup.id}</div>
                            </div>
                            <div>
                                <div className="info-label">Points to Redeem</div>
                                <div className="info-value">{-1 * Math.abs(lookup.pointsToRedeem ?? 0)}</div>
                            </div>
                            <div>
                                <div className="info-label">Remark</div>
                                <div className="info-value">{lookup.remark ?? "n/a"}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                            <button
                                className="action-btn"
                                type="button"
                                onClick={handleProcess}
                                disabled={loading || lookup.processed}
                            >
                                Process Redemption
                            </button>
                        </div>
                    </div>
                )}

                {/* Success modal will be shown by parent via onSuccess */}
            </div>
        </DetailsPopup>
    );
}
