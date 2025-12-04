import DetailsPopup from "./DetailsPopup";

export default function PromotionDetailsPopup({ promotion, onClose }) {
    if (!promotion) return null;

    return (
        <DetailsPopup onClose={onClose} title={promotion.name || "Promotion Details"}>
            <div style={{ padding: "0 1em" }}>
                <div><span style={{ color: "#888" }}>id</span><br /><b>{promotion.id}</b></div>
                <div><span style={{ color: "#888" }}>Type</span><br /><b>{promotion.type}</b></div>
                <div><span style={{ color: "#888" }}>End time</span><br /><b>{promotion.endTime ? new Date(promotion.endTime).toLocaleString() : "n/a"}</b></div>
                <div><span style={{ color: "#888" }}>Minimum Spending</span><br /><b>{promotion.minSpending ?? "n/a"}</b></div>
                <div><span style={{ color: "#888" }}>Rate</span><br /><b>{promotion.rate ?? "n/a"}</b></div>
                <div><span style={{ color: "#888" }}>Points</span><br /><b>{promotion.points ?? "n/a"}</b></div>
                <div><span style={{ color: "#888" }}>Description</span><br /><b>{promotion.description ?? "n/a"}</b></div>
            </div>
        </DetailsPopup>
    );
}