import styles from "./RedeemPoints.module.css";
import RedemptionTable from "../components/Tables/RedemptionTable";

function MyRedemptions() {
    return (
        <div className={styles.redeemPointsPageContainer}>
            <div className={styles.redeemPointsTableContainer}>
                <div className={styles.redeemPointsTableBottomContainer}>
                    <RedemptionTable redempTableTitle={"Unprocessed Redemptions"} processedBool={false} />
                    <RedemptionTable redempTableTitle={"Processed Redemptions"} processedBool={true} />
                </div>
            </div>
        </div>
    );
}

export default MyRedemptions;
