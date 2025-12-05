import { useEffect, useState } from "react";
import api from "../../api/api";
import "./ManageUserPopup.css";
import { Capitalize } from "../../utils/capitalize";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/formatDateTime";

function DetailRow({ label, value }) {
    return (
        <div className="mup-detail-row">
            <div className="mup-detail-label">{label}</div>
            <div className="mup-detail-value">{value ?? "--"}</div>
        </div>
    );
}

function ManageUserPopup({ show = true, onClose, user, onUserUpdate }) {
    const auth = useAuth();
    const currentUser = auth?.user || null;
    const [suspicious, setSuspicious] = useState(false);
    const [suspiciousSubmitting, setSuspiciousSubmitting] = useState(false);
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [showEmailEditPopup, setShowEmailEditPopup] = useState(false);
    const [emailValue, setEmailValue] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        setSuspicious(Boolean(user.suspicious));
        setVerified(Boolean(user.verified));
        setSelectedRole(user.role || "");
        setEmailValue(user.email || "");
        setShowEmailEditPopup(false);
        setHasChanges(false);
        setToast(null);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const roleChanged = selectedRole !== user.role;
        setHasChanges(roleChanged);
    }, [selectedRole, user]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2000);
        return () => clearTimeout(t);
    }, [toast]);

    const handleClose = () => {
        onClose?.();
        setToast(null);
    };

    if (!show || !user) return null;

    const toggleSuspicious = async () => {
        if (!user?.id) return;
        setSuspiciousSubmitting(true);
        try {
            await api.patch(`/users/${user.id}`, {
                suspicious: !suspicious,
            });
            setSuspicious(!suspicious);
            if (onUserUpdate) {
                onUserUpdate({ ...user, suspicious: !suspicious });
            }
            setToast({ type: "success", message: "Suspicious flag updated" });
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.error || "Failed to update flag" });
        } finally {
            setSuspiciousSubmitting(false);
        }
    };

    const handleVerify = async () => {
        if (!user?.id || verified) return;
        setVerifying(true);
        try {
            await api.patch(`/users/${user.id}`, {
                verified: true,
            });
            setVerified(true);
            if (onUserUpdate) {
                onUserUpdate({ ...user, verified: true });
            }
            setToast({ type: "success", message: "User verified" });
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.error || "Failed to verify user" });
        } finally {
            setVerifying(false);
        }
    };

    const handleConfirmChanges = async () => {
        if (!user?.id || !hasChanges) return;
        setSubmitting(true);
        try {
            const updates = {};
            if (selectedRole !== user.role) {
                updates.role = selectedRole;
            }

            await api.patch(`/users/${user.id}`, updates);
            
            if (onUserUpdate) {
                onUserUpdate({ ...user, ...updates });
            }
            
            setHasChanges(false);
            setToast({ type: "success", message: "Changes saved successfully" });
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.error || "Failed to save changes" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!user?.id || emailValue === user.email || !emailValue.trim()) {
            setShowEmailEditPopup(false);
            setEmailValue(user.email || "");
            return;
        }
        setSubmitting(true);
        try {
            await api.patch(`/users/${user.id}`, { email: emailValue.trim() });
            const updatedUser = { ...user, email: emailValue.trim() };
            if (onUserUpdate) {
                onUserUpdate(updatedUser);
            }
            // Force re-render by updating the user reference
            setToast({ type: "success", message: "Email updated successfully" });
            setShowEmailEditPopup(false);
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.error || "Failed to update email" });
        } finally {
            setSubmitting(false);
        }
    };

    const getAvailableRoles = () => {
        if (!currentUser) return [];
        const currentUserRole = currentUser.role;
        if (currentUserRole === "superuser") {
            return ["regular", "cashier", "manager", "superuser"];
        } else if (currentUserRole === "manager") {
            return ["regular", "cashier"];
        }
        return [];
    };

    const availableRoles = getAvailableRoles();
    const canPromote = availableRoles.length > 0;

    return (
        <div className="manage-user-popup" onClick={handleClose}>
            <div className="manage-user-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="manage-user-popup-close-button" onClick={handleClose} aria-label="Close">×</button>
                <div className="mup-header">
                    <div>
                        <div className="mup-title">{user.name}</div>
                        <div className="mup-utorid">{user.utorid || "--"}</div>
                    </div>
                    <div className="mup-header-row">
                        <img
                            src={(user?.avatarUrl) || "/default-pfp.jpg"}
                            alt="Profile"
                            className="mup-avatar"
                        />
                        {!verified && (
                            <button className="mup-verify" onClick={handleVerify} disabled={verifying}>
                                {verifying ? "Verifying..." : "Verify"}
                            </button>
                        )}
                        {verified && (
                            <button className="mup-verified" disabled>
                                Verified
                            </button>
                        )}
                        <button
                            className={`mup-flag ${suspicious ? "active" : ""}`}
                            onClick={toggleSuspicious}
                            disabled={suspiciousSubmitting}
                            title="Toggle suspicious"
                        >
                            ⚑
                        </button>
                    </div>
                </div>
                <div className="mup-details">
                    <DetailRow label="ID" value={user.id} />
                    <DetailRow label="Verified" value={verified ? "Yes" : "No"} />
                    <div className="mup-detail-row">
                        <div className="mup-detail-label">Role</div>
                        {canPromote ? (
                            <select 
                                className="mup-role-select-inline"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {availableRoles.map(role => (
                                    <option key={role} value={role}>
                                        {Capitalize(role)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="mup-detail-value">{Capitalize(user.role)}</div>
                        )}
                    </div>
                    <DetailRow label="Created At" value={formatDate(user.createdAt)} />
                    <div className="mup-detail-row">
                        <div className="mup-email-label-container">
                            <div className="mup-detail-label">Email</div>
                            <button
                                className="mup-edit-icon"
                                onClick={() => {
                                    setEmailValue(user?.email || "");
                                    setShowEmailEditPopup(true);
                                }}
                                title="Edit email"
                            >
                                ✎
                            </button>
                        </div>
                        <div className="mup-detail-value mup-email-display">
                            {user?.email || "�"}
                        </div>
                    </div>
                    <DetailRow label="Last Login" value={formatDate(user.lastLogin)} />
                    <DetailRow label="Birthday" value={formatDate(user.birthday)} />
                    <DetailRow label="Promotions" value={user.promotions?.length ? user.promotions.length : "—"} />
                    <DetailRow label="Points" value={user.points} />
                    <DetailRow label="Suspicious" value={suspicious ? "Yes" : "No"} />
                </div>
                {hasChanges && (
                    <button 
                        className="mup-confirm-button" 
                        onClick={handleConfirmChanges}
                        disabled={submitting}
                    >
                        {submitting ? "Saving..." : "Confirm Changes"}
                    </button>
                )}
            </div>
            {toast && (
                <div className={`mup-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
            {showEmailEditPopup && (
                <div className="mup-email-edit-overlay" onClick={() => {
                    setShowEmailEditPopup(false);
                    setEmailValue(user.email || "");
                }}>
                    <div className="mup-email-edit-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="mup-email-edit-header">
                            <span className="mup-email-edit-title">Edit Email</span>
                            <button className="mup-email-edit-close" onClick={() => {
                                setShowEmailEditPopup(false);
                                setEmailValue(user.email || "");
                            }}>�</button>
                        </div>
                        <input
                            type="email"
                            className="mup-email-edit-input"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveEmail();
                                } else if (e.key === "Escape") {
                                    setShowEmailEditPopup(false);
                                    setEmailValue(user.email || "");
                                }
                            }}
                            placeholder="Enter new email"
                            autoFocus
                        />
                        <div className="mup-email-edit-actions">
                            <button className="mup-email-edit-cancel" onClick={() => {
                                setShowEmailEditPopup(false);
                                setEmailValue(user.email || "");
                            }}>
                                Cancel
                            </button>
                            <button 
                                className="mup-email-edit-save" 
                                onClick={handleSaveEmail}
                                disabled={submitting || emailValue === user.email || !emailValue.trim()}
                            >
                                {submitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUserPopup;
















