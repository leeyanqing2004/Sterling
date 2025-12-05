import DetailsPopup from "./DetailsPopup";
import { formatDateTimePretty } from "../../utils/formatDateTime";
import { Capitalize } from "../../utils/capitalize";

const PLACEHOLDERS = {
    description: "(No description provided)",
    type: "(No type specified)",
};

export default function PromotionDetailsPopup({ promotion, onClose }) {
    if (!promotion) return null;

    return (
        <DetailsPopup
            onClose={onClose}
            title={promotion.name || "Promotion Details"}
            fields={[
                { label: "ID", value: promotion.id },
                { label: "Type", value: Capitalize(promotion.type), placeholder: PLACEHOLDERS.type },
                { label: "Start time", value: formatDateTimePretty(promotion.startTime) },
                { label: "End time", value: formatDateTimePretty(promotion.endTime) },
                { label: "Minimum Spending", value: promotion.minSpending ?? "n/a" },
                { label: "Rate", value: promotion.rate ?? "n/a" },
                { label: "Points", value: promotion.points ?? "n/a" },
                { label: "Description", value: promotion.description, placeholder: PLACEHOLDERS.description },
            ]}
        />
    );
}
