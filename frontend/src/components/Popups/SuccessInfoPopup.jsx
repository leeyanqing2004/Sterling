import DetailsPopup from "./DetailsPopup";

export default function SuccessInfoPopup({ title = "Success", lines = [], onClose }) {
  return (
    <DetailsPopup title={title} onClose={onClose}>
      <div className="info-list">
        {lines.map((line, idx) => (
          <div className="info-field" key={idx}>
            <div className="info-value">{line}</div>
          </div>
        ))}
      </div>
    </DetailsPopup>
  );
}
