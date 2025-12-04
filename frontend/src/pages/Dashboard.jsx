import { AvailablePointsDisplay, StartTransactionQR } from "../components/Dashboard/DashboardTopSection";
import styles from "./Dashboard.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getRecentTransactions } from "../api/getTransactionsApi";
import { getMyPoints } from "../api/pointsAndQrApi.js";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import TransferPointsPopup from "../components/TransferPoints";
import RedeemPointsPopup from "../components/RedeemPointsPopup";
import PanelActionButton from "../components/Buttons/PanelActionButton";
import RegisterUserPopup from "../components/Popups/RegisterUserPopup";
import NewPurchasePopup from "../components/Popups/NewPurchasePopup";
import { getPromotions } from "../api/getPromotionsApi";
import { createPurchase } from "../api/getTransactionsApi";
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
    const [showPurchasePopup, setShowPurchasePopup] = useState(false);
    const [promotionsOptions, setPromotionsOptions] = useState([]);
    const [registeredUser, setRegisteredUser] = useState(null);
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

            // load promotions for purchase popup
            try {
                const promos = await getPromotions({ limit: 1000 });
                setPromotionsOptions(promos.results || []);
            } catch (err) {
                console.error("Failed to load promotions", err);
                setPromotionsOptions([]);
            }
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
                                    onClick={() => setShowPurchasePopup(true)}
                                />
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
        {isCashier && showPurchasePopup && (
            <NewPurchasePopup
                initialUtorid=""
                promotionsOptions={promotionsOptions}
                onSubmit={async ({ utorid, spent, promotionIds, remark }) => {
                    const res = await createPurchase({ utorid, spent, promotionIds, remark });
                    return res;
                }}
                onClose={() => setShowPurchasePopup(false)}
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
