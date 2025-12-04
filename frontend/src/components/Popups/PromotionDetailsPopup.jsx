import DetailsPopup from "./DetailsPopup";

const PLACEHOLDERS = {
    description: "(No description provided)",
    type: "(No type specified)",
};

export default function PromotionDetailsPopup({ promotion, onClose }) {
    if (!promotion) return null;

    const formatDateTime = (value) => {
        if (!value) return "n/a";
        const d = new Date(value);
        return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
    };

    return (
        <DetailsPopup
            onClose={onClose}
            title={promotion.name || "Promotion Details"}
            fields={[
                { label: "ID", value: promotion.id },
                { label: "Type", value: promotion.type, placeholder: PLACEHOLDERS.type },
                { label: "Start time", value: formatDateTime(promotion.startTime) },
                { label: "End time", value: formatDateTime(promotion.endTime) },
                { label: "Minimum Spending", value: promotion.minSpending ?? "n/a" },
                { label: "Rate", value: promotion.rate ?? "n/a" },
                { label: "Points", value: promotion.points ?? "n/a" },
                { label: "Description", value: promotion.description, placeholder: PLACEHOLDERS.description },
            ]}
        />
    );
}