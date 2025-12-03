import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import { AvailablePointsDisplay, StartTransactionQR } from "../components/Dashboard/DashboardTopSection";
import styles from "./Dashboard.module.css";
import Button from '@mui/material/Button';
import TransactionTable from "../components/Tables/TransactionTable";
import { getRecentTransactions } from "../api/getTransactionsApi";
import { getMyPoints } from "../api/pointsAndQrApi";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

// TODO: should we move the Nav and LeftNav components out of the Profile folder, since we'll use it
// for multiple pages?

function Dashboard() {

    const { user } = useAuth();
    // const user = "cashier"; // FOR TESTING ONLY

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [availablePoints, setavailablePoints] = useState(0);
    {/* const [qrInfo, setQrInfo] = useState([]); */}

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

    return <div className={styles.dashboardPageContainer}>

        {/* top Nav container */}
        <div className={styles.dashboardNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.dashboardLeftNavAndDashContainer}>

            {/* left Nav container */}
            <div className={styles.dashboardleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.dashboardDashContainer}>

                <div className={styles.dashboardDashTopContainer}>

                    {/* Available Points container */}
                    <div className={styles.dashboardAvailPoints}>
                        <AvailablePointsDisplay availablePoints={availablePoints} />
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

            </div>
        </div>
    </div>;
}

export default Dashboard;