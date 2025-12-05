import { AvailablePointsDisplay, StartTransactionQR } from "../components/Dashboard/DashboardTopSection";
import styles from "./Dashboard.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getRecentTransactions } from "../api/getTransactionsApi";
import { getMyPoints } from "../api/pointsAndQrApi.js";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import TransferPointsPopup from "../components/TransferPoints";
import RedeemPointsPopup from "../components/Popups/RedeemPointsPopup";

// TODO: should we move the Nav and LeftNav components out of the Profile folder, since we'll use it
// for multiple pages?

function Dashboard() {

    const { user } = useAuth();
    // const user = "cashier"; // FOR TESTING ONLY

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [availablePoints, setavailablePoints] = useState(0);
    {/* const [qrInfo, setQrInfo] = useState([]); */}
    const [showTransfer, setShowTransfer] = useState(false);
    const [showRedeem, setShowRedeem] = useState(false);

    useEffect(() => {
        async function loadData() {
            const data = await getRecentTransactions();
            setRecentTransactions(data.results);
            setCount(data.count);

            const pointsData = await getMyPoints();
            setavailablePoints(pointsData);
        }
        loadData();
    }, []);

    return (
        <div className={styles.dashboardDashContainer}>
                <div className={styles.dashboardDashTopContainer}>

                    {/* Available Points container */}
                    <div className={styles.dashboardAvailPoints}>
                        <AvailablePointsDisplay 
                            availablePoints={availablePoints} 
                            onTransfer={() => setShowTransfer(true)}
                            onRedeem={() => setShowRedeem(true)}
                        />
                    </div>

                {/* QR Code container */}
                <div className={styles.dashboardQR}>
                    <StartTransactionQR qrCodeInfo={"QR CODE INFO HERE"} />
                </div>

                {/*{user?.role === "cashier" && ( */}
                {user === "cashier" && (
                    <div className={styles.cashierButtonContainer}>
                        <div className={styles.cashierButton}>
                            <button>+ Register New User</button>
                        </div>
                        <div className={styles.cashierButton}>
                            <button>+ Search User</button>
                        </div>
                        <div className={styles.cashierButton}>
                            <button>+ Create Purchase</button>
                        </div>
                    </div>
                )}

            </div>

            <div className={styles.dashboardDashBottomContainer}>
                <TransactionTable transTableTitle={"Recent Transactions"} includeManageButton={false} recentOnlyBool={true} transactions={recentTransactions}/>
            </div>

            {showTransfer && <TransferPointsPopup onClose={() => setShowTransfer(false)} />}
            {showRedeem && <RedeemPointsPopup show={showRedeem} setShow={setShowRedeem} />}
        </div>
    );
}

export default Dashboard;
