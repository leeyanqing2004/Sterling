import { useState } from "react";
import DetailsPopup from "./DetailsPopup";
import PopupFormField from "./PopupFormField";
import { registerUser } from "../../api/usersApi";

const INITIAL_FORM = {
    utorid: "",
    name: "",
    email: "",
};

export default function RegisterUserPopup({ open, onClose, onSuccess }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
        setStatusMessage("");
    };

    const validate = () => {
        const nextErrors = {};
        if (!/^[a-z][a-z0-9]{6,7}$/i.test(form.utorid.trim())) {
            nextErrors.utorid = "Utorid must be 7-8 characters.";
        }
        if (!form.name.trim()) {
            nextErrors.name = "Name is required.";
        }
        if (!form.email.trim().endsWith("mail.utoronto.ca")) {
            nextErrors.email = "Use a valid mail.utoronto.ca address.";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setStatusMessage("");
        try {
            await registerUser({
                utorid: form.utorid.trim(),
                name: form.name.trim(),
                email: form.email.trim(),
            });
            setForm(INITIAL_FORM);
            setStatusMessage("User registered successfully.");
            if (onSuccess) onSuccess();
        } catch (err) {
            const message =
                err?.response?.data?.error ||
                "Something went wrong. Please try again.";
            setStatusMessage(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DetailsPopup
            open={open}
            onClose={onClose}
            title="New user"
        >
            <form className="popup-form" onSubmit={handleSubmit}>
                <PopupFormField
                    label="Utorid"
                    name="utorid"
                    value={form.utorid}
                    onChange={setField("utorid")}
                    placeholder="johnsmith"
                    helperText="must be a valid utorid"
                    error={errors.utorid}
                />
                <PopupFormField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="John Smith"
                    helperText="corresponding error message"
                    error={errors.name}
                />
                <PopupFormField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    placeholder="john.smith@mail.utoronto.ca"
                    helperText="corresponding error message"
                    error={errors.email}
                    autoComplete="email"
                />
                {statusMessage && (
                    <div className="form-status">{statusMessage}</div>
                )}
                <button
                    className="action-btn"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "Registering..." : "Register User"}
                </button>
            </form>
        </DetailsPopup>
    );
}


