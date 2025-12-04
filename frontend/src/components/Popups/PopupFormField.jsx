import "./DetailsPopup.css";

export default function PopupFormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    helperText,
    error,
    autoComplete = "off",
}) {
    return (
        <label className="popup-form-field">
            <span className="field-label">{label}</span>
            <input
                className={`field-input ${error ? "has-error" : ""}`}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
            <span className={`field-helper ${error ? "error-text" : ""}`}>
                {error || helperText}
            </span>
        </label>
    );
}


