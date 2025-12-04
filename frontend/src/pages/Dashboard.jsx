import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import { AvailablePointsDisplay, StartTransactionQR } from "../components/Dashboard/DashboardTopSection";
import styles from "./Dashboard.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getRecentTransactions } from "../api/getTransactionsApi";
import { getMyPoints } from "../api/pointsAndQrApi";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import PanelActionButton from "../components/Buttons/PanelActionButton";
import RegisterUserPopup from "../components/Popups/RegisterUserPopup";
import DetailsPopup from "../components/Popups/DetailsPopup";

// TODO: should we move the Nav and LeftNav components out of the Profile folder, since we'll use it
// for multiple pages?

function Dashboard() {
   //  const user = "cashier"
    const { user } = useAuth();
    const isCashier = user?.role === "cashier";

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [availablePoints, setavailablePoints] = useState(0);
    const [showRegisterPopup, setShowRegisterPopup] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);
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

                    {isCashier && (
                        <div className={styles.cashierButtonContainer}>
                            <div className={styles.cashierButton}>
                                <PanelActionButton
                                    label="+ Register New User"
                                    onClick={() => setShowRegisterPopup(true)}
                                />
                            </div>
                            <div className={styles.cashierButton}>
                                <PanelActionButton
                                    label="+ Search User"
                                    onClick={() => window.location.assign("/user-search")}
                                />
                            </div>
                            <div className={styles.cashierButton}>
                                <PanelActionButton
                                    label="+ Create Purchase"
                                    onClick={() => {}}
                                />
                            </div>
                        </div>
                    )}

                </div>

                <div className={styles.dashboardDashBottomContainer}>
                    <TransactionTable transTableTitle={"Recent Transactions"} includeManageButton={false} recentOnlyBool={true} transactions={recentTransactions}/>
                </div>

            </div>
        </div>
        {isCashier && (
            <RegisterUserPopup
                open={showRegisterPopup}
                onClose={() => setShowRegisterPopup(false)}
                onSuccess={(userData) => {
                    setShowRegisterPopup(false);
                    setRegisteredUser(userData);
                }}
            />
        )}
        {registeredUser && (
            <DetailsPopup
                open={true}
                onClose={() => setRegisteredUser(null)}
                title="User Registered!"
                fields={[
                    { label: "Utorid", value: registeredUser.utorid },
                    { label: "Name", value: registeredUser.name },
                    { label: "Email", value: registeredUser.email },
                ]}
                primaryAction={{
                    label: "Close",
                    onClick: () => setRegisteredUser(null),
                    className: "action-btn",
                }}
            />
        )}
    </div>;
}

export default Dashboard;