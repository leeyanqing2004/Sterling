import styles from "./RedeemPoints.module.css";
import RedemptionTable from "../components/Tables/RedemptionTable";
import RedeemPointsPopup from "../components/Popups/RedeemPointsPopup";
import { useState } from "react";

function RedeemPoints() {
    const [showRedeem, setShowRedeem] = useState(false);
    return <div className={styles.redeemPointsPageContainer}>

        <div className={styles.redeemPointsTableContainer}>
            <div className={styles.redeemPointsTableTopContainer}>
                <button onClick={() => setShowRedeem(true)}>+ Create New Redemption Request</button>
            </div>
            <div className={styles.redeemPointsTableBottomContainer}>
                <RedemptionTable redempTableTitle={"Unprocessed Redemptions"} processedBool={false}/>
                <RedemptionTable redempTableTitle={"Processed Redemptions"} processedBool={true}/>
            </div>
        </div>
        {showRedeem && <RedeemPointsPopup show={showRedeem} setShow={setShowRedeem} />}
    </div>;
}

export default RedeemPoints;
