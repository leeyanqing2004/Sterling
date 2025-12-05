import styles from "./DashboardTopSection.module.css";

export function AvailablePointsDisplay({ availablePoints, className, onTransfer, onRedeem, onRaffleExploration, loading = false }) {
    return (
        <div className={`${styles.dashboardAvailPointsContainer} ${className}`}>
            <p className={styles.dashboardAvailPointsTitle}>Available Points</p>
            <div className={styles.dashboardPointsAmountRow}>
                {loading ? (
                    <span className={styles.pointsSpinner} aria-label="Loading points" />
                ) : (
                    <p className={styles.dashboardAvailPointsAmount}>{availablePoints ?? "—"}</p>
                )}
            </div>
            <div className={styles.dashboardPointsActions}>
                <button onClick={onTransfer} disabled={loading}>Transfer Points</button>
                <button onClick={onRedeem} className={styles.secondary} disabled={loading}>Redeem Points</button>
            </div>
            {onRaffleExploration && (
                <div className={styles.dashboardRaffleAction}>
                    <button onClick={onRaffleExploration} disabled={loading} className={styles.raffleButton}>
                        View Raffles
                    </button>
                </div>
            )}
        </div>
    );
}

export function StartTransactionQR({ qrCodeInfo, className }) {
    return (
        <div className={`${styles.dashboardStartTransQRContainer} ${className}`}>
            <p className={styles.dashboardStartTransQRTitle}>Scan to start a transaction</p>
            <p className={styles.dashboardStartTransQRImg}>{qrCodeInfo}</p>
        </div>
    );
}
