import { useState, useEffect } from "react";
import DetailsPopup from "./DetailsPopup";
import PopupFormField from "./PopupFormField";
import { processRedemption, getAllTransactions } from "../../api/getTransactionsApi";
export default function ProcessRedemptionPopup({ onClose, onSuccess, utorid = "", userName = "" }) {
    const [txId, setTxId] = useState("");
    const [lookup, setLookup] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [redeemables, setRedeemables] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState("");

    useEffect(() => {
        const fetchRedeemables = async () => {
            if (!utorid) return;
            setListLoading(true);
            setListError("");
            try {
                const res = await getAllTransactions({
                    type: "redemption",
                    processed: false,
                    utorid,
                    limit: 20,
                    page: 1,
                });
                setRedeemables(res.results || []);
            } catch (err) {
                console.error("Failed to fetch redeemables", err);
                setListError("Couldn't load unprocessed redemptions. Try again.");
                setRedeemables([]);
            } finally {
                setListLoading(false);
            }
        };
        fetchRedeemables();
    }, [utorid]);

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
            if (onSuccess) onSuccess(payload);
            // Remove processed redemption from local list and reset form
            setRedeemables((prev) => prev.filter((tx) => tx.id !== lookup.id));
            setLookup(res ? { ...res, processed: true } : { ...lookup, processed: true });
            setTxId("");
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to process redemption");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DetailsPopup onClose={onClose} title="Process Redemption">
            <div className="popup-form">
                {utorid && (
                    <div style={{ marginTop: "1rem" }}>
                        <div className="info-label" style={{ marginBottom: 6 }}>
                            Unprocessed redemptions for {userName ? `${userName} (${utorid})` : utorid}
                        </div>
                        {listLoading ? (
                            <div className="popup-error">Loading...</div>
                        ) : listError ? (
                            <div className="popup-error">{listError}</div>
                        ) : redeemables.length === 0 ? (
                            <div className="popup-error">No unprocessed redemptions.</div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    maxHeight: 180,
                                    overflowY: "auto",
                                    background: "#f7f9fc",
                                    border: "1px solid #e6ecf5",
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                }}
                            >
                                {redeemables.map((tx) => {
                                    const amount = Math.abs(tx.pointsToRedeem ?? tx.redeemed ?? tx.amount ?? tx.spent ?? 0);
                                    return (
                                        <button
                                            key={tx.id}
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() => {
                                                setTxId(String(tx.id));
                                                setLookup({
                                                    id: tx.id,
                                                    pointsToRedeem: tx.pointsToRedeem ?? tx.redeemed ?? tx.amount ?? tx.spent ?? 0,
                                                    remark: tx.remark ?? "",
                                                });
                                            }}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                padding: "10px 12px",
                                                borderRadius: 12,
                                                background: "#fff",
                                            }}
                                        >
                                            <div style={{ textAlign: "left" }}>
                                                <div style={{ fontWeight: 700, color: "#2A73B7" }}>#{tx.id}</div>
                                                <div style={{ fontSize: 12, color: "#4b5563" }}>{tx.remark || "No remark"}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: "#1f5a8f" }}>{amount} pts</div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

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
            </div>
        </DetailsPopup>
    );
}
