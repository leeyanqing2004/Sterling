import styles from "./PrimaryButtonComponent.module.css"

export default function PrimaryButton({ type, onClick, children }) {
    return (
        <button className={styles.primaryButton} type={type} onClick={onClick}>
            {children}
        </button>
    )
}