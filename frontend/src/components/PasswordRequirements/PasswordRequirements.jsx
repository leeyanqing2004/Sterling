import styles from "./PasswordRequirements.module.css"

export default function PasswordRequirements() {
    return (
        <>
            <div className={styles.passwordRequirements}>
                <p>Your password must include:</p>
                <ul>
                    <li>8-20 characters</li>
                    <li>at least one uppercase letter</li>
                    <li>at least one lowercase letter</li>
                    <li>at least one number</li>
                    <li>at least one special character</li>
                </ul>
            </div>
        </>
    );
}
