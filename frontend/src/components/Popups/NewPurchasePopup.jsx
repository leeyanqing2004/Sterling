import { useState } from "react";
import DetailsPopup from "./DetailsPopup";
import PopupFormField from "./PopupFormField";
// Use the shared popup action button styling (action-btn)

export default function NewPurchasePopup({ initialUtorid = "", promotionsOptions = [], onSubmit, onClose }) {
  const [utorid, setUtorid] = useState(initialUtorid);
  const [spent, setSpent] = useState("");
  const [remark, setRemark] = useState("");
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const numericSpent = Number(String(spent).replace(/\s+/g, ""));
    if (!utorid || Number.isNaN(numericSpent) || numericSpent < 0) {
      setError("Please enter a valid utorid and non-negative amount.");
      return;
    }
    try {
      await onSubmit({ utorid, spent: numericSpent, promotionIds: selectedPromotionIds, remark });
      onClose();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to create purchase.");
    }
  };

  return (
    <DetailsPopup title="New Purchase" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <PopupFormField
          label="UTORid"
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          placeholder="e.g. johndoe1"
        />
        <PopupFormField
          label="Amount Spent"
          value={spent}
          onChange={(e) => setSpent(e.target.value)}
          placeholder="e.g. 112.50"
        />

        {/* Multi-select Promotions */}
        <div>
          <div style={{ color: "#888", marginBottom: "0.25rem" }}>Promotions</div>
          <select
            multiple
            value={selectedPromotionIds}
            onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
              setSelectedPromotionIds(opts);
            }}
            style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd" }}
          >
            {promotionsOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (#{p.id})
              </option>
            ))}
          </select>
        </div>

        <PopupFormField
          label="Remarks"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Optional"
        />

        {error && <div className="popup-error">{error}</div>}

        <button className="action-btn" onClick={handleSubmit}>
          Create Purchase
        </button>
      </div>
    </DetailsPopup>
  );
}
