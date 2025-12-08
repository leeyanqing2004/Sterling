import { AvailablePointsDisplay, StartTransactionQR } from "../components/Dashboard/DashboardTopSection";
import styles from "./Dashboard.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getRecentTransactions, getMyTransactions } from "../api/getTransactionsApi";
import { getMyPoints } from "../api/pointsAndQrApi.js";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import TransferPointsPopup from "../components/Popups/TransferPoints";
import RedeemPointsPopup from "../components/Popups/RedeemPointsPopup";
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
    const isCashierOrHigher = ["cashier", "manager", "superuser"].includes(user?.role);

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [recentLoading, setRecentLoading] = useState(false);
    const [availablePoints, setavailablePoints] = useState(user?.points ?? null);
    // const [qrInfo, setQrInfo] = useState([]);
    const [showRegisterPopup, setShowRegisterPopup] = useState(false);
    const [showPurchasePopup, setShowPurchasePopup] = useState(false);
    const [promotionsOptions, setPromotionsOptions] = useState([]);
    const [registeredUser, setRegisteredUser] = useState(null);
    // const [qrInfo, setQrInfo] = useState([]);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showRedeem, setShowRedeem] = useState(false);
    const [pointsLoading, setPointsLoading] = useState(user?.points == null);
    const [pointsRecap, setPointsRecap] = useState({ weekEarned: 0, weekSpent: 0, monthEarned: 0, monthSpent: 0, recentTrend: [] });
    const [txPage, setTxPage] = useState(0);
    const [txRowsPerPage, setTxRowsPerPage] = useState(10);
    const [txTotal, setTxTotal] = useState(0);
    const [txLoading, setTxLoading] = useState(false);
    const [txRows, setTxRows] = useState([]);
    const didLoadRef = useRef(false);

    const computePointsRecap = useCallback(async () => {
        try {
            const txRes = await getMyTransactions({ limit: 300, page: 1 });
            const txs = txRes.results || [];
            const now = new Date();
            const startWeek = new Date(now);
            startWeek.setDate(now.getDate() - 7);
            const startMonth = new Date(now);
            startMonth.setDate(now.getDate() - 30);

            let weekEarned = 0, weekSpent = 0, monthEarned = 0, monthSpent = 0;
            const trendDays = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now);
                d.setDate(now.getDate() - (6 - i));
                d.setHours(0,0,0,0);
                return { day: d, value: 0 };
            });

            txs.forEach(tx => {
                const txDate = new Date(tx.createdAt || tx.date || tx.updatedAt || now);
                if (isNaN(txDate.getTime())) return;
                const amountVal = typeof tx.amount === "number" ? tx.amount : 0;
                const spentVal = typeof tx.spent === "number" ? tx.spent : (amountVal < 0 ? Math.abs(amountVal) : 0);
                const earnedVal = amountVal > 0 ? amountVal : 0;

                if (txDate >= startMonth) {
                    monthEarned += earnedVal;
                    monthSpent += spentVal;
                }
                if (txDate >= startWeek) {
                    weekEarned += earnedVal;
                    weekSpent += spentVal;
                }

                trendDays.forEach(td => {
                    const sameDay = td.day.getFullYear() === txDate.getFullYear() &&
                        td.day.getMonth() === txDate.getMonth() &&
                        td.day.getDate() === txDate.getDate();
                    if (sameDay) {
                        td.value += earnedVal - spentVal;
                    }
                });
            });

            setPointsRecap({
                weekEarned,
                weekSpent,
                monthEarned,
                monthSpent,
                recentTrend: trendDays.map(td => td.value),
            });
        } catch (err) {
            console.error("Failed to load points recap", err);
            setPointsRecap({ weekEarned: 0, weekSpent: 0, monthEarned: 0, monthSpent: 0, recentTrend: [] });
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setPointsLoading(true);
            try {
                const pointsData = await getMyPoints();
                if (typeof pointsData === "number") {
                    setavailablePoints(pointsData);
                }
            } finally {
                setPointsLoading(false);
            }

            await computePointsRecap();

            try {
                const promos = await getPromotions({ limit: 1000 });
                setPromotionsOptions(promos.results || []);
            } catch (err) {
                console.error("Failed to load promotions", err);
                setPromotionsOptions([]);
            }
        };

        loadData();
    }, [computePointsRecap]);

    // load paginated transactions for browsing history
    useEffect(() => {
        const loadTx = async () => {
            setTxLoading(true);
            try {
                const res = await getMyTransactions({ page: txPage + 1, limit: txRowsPerPage });
                setTxRows(res.results || []);
                setTxTotal(res.count || 0);
                // refresh recap when transactions list is fetched
                await computePointsRecap();
            } catch (err) {
                console.error("Failed to load transactions", err);
                setTxRows([]);
                setTxTotal(0);
            } finally {
                setTxLoading(false);
            }
        };
        loadTx();
    }, [txPage, txRowsPerPage]);

    return (
        <>
            <div className={styles.dashboardDashContainer}>
                <div className={styles.dashboardDashTopContainer}>

                    {/* Available Points container */}
                    <div className={styles.dashboardAvailPoints}>
                        <AvailablePointsDisplay 
                            availablePoints={availablePoints} 
                            loading={pointsLoading}
                            onTransfer={() => setShowTransfer(true)}
                            onRedeem={() => setShowRedeem(true)}
                            onRaffleExploration={() => window.location.assign("/all-raffles")}
                        />
                    </div>

                    <div className={styles.dashboardPointsRecap}>
                        <div className={styles.recapHeader}>
                            <div>
                                <div className={styles.recapTitle}>Points Recap</div>
                                <div className={styles.recapSubtitle}>Last 7 & 30 days</div>
                            </div>
                        </div>
                        <div className={styles.recapRow}>
                            <span>Week</span>
                            <span className={styles.recapValue}>+{pointsRecap.weekEarned} / -{pointsRecap.weekSpent}</span>
                        </div>
                        <div className={styles.recapRow}>
                            <span>Month</span>
                            <span className={styles.recapValue}>+{pointsRecap.monthEarned} / -{pointsRecap.monthSpent}</span>
                        </div>
                        {pointsRecap.recentTrend.length > 0 && (
                            <div className={styles.sparkline} aria-label="Weekly point trend">
                                {pointsRecap.recentTrend.map((v, idx) => {
                                    const clamped = Math.max(Math.min(v, 100), -100);
                                    // 0 should be essentially flat; map -100..100 to 4..50 px
                                    const baseHeight = 4; // minimum bar height for visibility
                                    const maxHeight = 50;
                                    const height = baseHeight + ((Math.abs(clamped) / 100) * (maxHeight - baseHeight));
                                    const isNegative = v < 0;
                                    return (
                                        <div
                                            key={idx}
                                            className={`${styles.sparkBar} ${isNegative ? styles.sparkBarNeg : ""}`}
                                            style={{ height: `${height.toFixed(1)}px` }}
                                            title={`Day ${idx + 1}: ${v}`}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* QR Code container */}
                    <div className={styles.dashboardQR}>
                        <StartTransactionQR qrCodeInfo={<img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("Redemption for user: " + (user?.utorid))}`} 
                            alt="QR Code"
                        />} />
                    </div>

                    {isCashierOrHigher && (
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
                    <TransactionTable
                        transTableTitle={"Recent Transactions"}
                        includeManageButton={false}
                        recentOnlyBool={false}
                        transactions={txRows}
                        serverPaging={true}
                        page={txPage}
                        rowsPerPage={txRowsPerPage}
                        onPageChange={(p) => setTxPage(p)}
                        onRowsPerPageChange={(r) => { setTxRowsPerPage(r); setTxPage(0); }}
                        totalCount={txTotal}
                        loading={txLoading}
                    />
                </div>

                {showTransfer && <TransferPointsPopup onClose={() => setShowTransfer(false)} />}
                {showRedeem && <RedeemPointsPopup show={showRedeem} setShow={setShowRedeem} />}
            </div>
            {isCashierOrHigher && (
                <RegisterUserPopup
                    open={showRegisterPopup}
                    onClose={() => setShowRegisterPopup(false)}
                    onSuccess={(userData) => {
                        setShowRegisterPopup(false);
                        setRegisteredUser(userData);
                    }}
                />
            )}
            {isCashierOrHigher && showPurchasePopup && (
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
            {isCashierOrHigher && registeredUser && (
                <DetailsPopup
                    open={true}
                    onClose={() => setRegisteredUser(null)}
                    title="User Registered!"
                    fields={[
                        { label: "UTORid", value: registeredUser.utorid },
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
        </>
    )
}

export default Dashboard;
