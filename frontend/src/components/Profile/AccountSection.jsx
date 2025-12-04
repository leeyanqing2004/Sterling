import { useAuth } from "../../contexts/AuthContext.jsx";
import styles from "./AccountSection.module.css";

function AccountInfo({ label, value }) {
    return <div className={styles.accountSectionAccountInfo}>
        <p className={styles.accountSectionAccountInfoLabel}>{label}</p>
        <p className={styles.accountSectionAccountInfoValue}>{value}</p>
    </div>;
}

function AccountSection({ id, className }) {
    const { user } = useAuth();
    const utorid = user?.utorid;
    const role = user?.role;
    const createdAt = user?.createdAt;
    const memberSince = new Date(createdAt).toDateString();
    // const status = user?.status;

    function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return  <div id={id} className={`${styles.accountSection} ${className || ''}`}>
                <div className={styles.accountSectionDetails}>
                    <div className={styles.accountSectionSettings}>
                        <h2 className={styles.accountSectionTitle}>Account Details</h2>
                        {AccountInfo({label: "UTORid", value: utorid})}
                        {AccountInfo({label: "Role", value: Capitalize(role)})}
                        {AccountInfo({label: "Member Since", value: memberSince})}
                        {/* {AccountInfo({label: "Status", value: status})} */}
                    </div>
                </div>
            </div>;
}

export default AccountSection;