import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AllPromotions.module.css";
import PromotionsTable from "../components/Tables/PromotionsTable";
import { getPromotions } from "../api/getPromotionsApi";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NewPromotionPopup from "../components/Popups/NewPromotionPopup";

function AllPromotions() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0); // 0-based for UI (client-side)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showNewPromo, setShowNewPromo] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (user?.role === "manager" || user?.role === "superuser") {
                    // load a large page once; client-side filters/pagination handle the rest
                    const data = await getPromotions({ limit: 1000, page: 1 });
                    const list = data?.results || [];
                    setPromotions(list);
                    setCount(list.length);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user, refreshKey]);

    useEffect(() => {
        if (!user) return;
        const isManager = user.role === "manager" || user.role === "superuser";
        if (!isManager) {
            navigate("/available-promotions", { replace: true });
        }
    }, [user, navigate]);
    
    return <div className={styles.allPromoPageContainer}>
        {/* everything under the top Nav container */}
        <div className={styles.allPromoLeftNavAndTableContainer}>
            {/* everything to the right of the left Nav container */}
            <div className={styles.allPromoTableContainer}>
                <div className={styles.allPromoTableTopContainer}>
                    <button
                        className={styles.allPromoTableTopContainerButton}
                        onClick={() => setShowNewPromo(true)}
                    >
                        + Create New Promotion
                    </button>
                </div>

                <PromotionsTable
                    promoTableTitle={"All Promotions"}
                    availableOnlyBool={false}
                    promotions={promotions}
                    serverPaging={false}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={(val) => {
                        setRowsPerPage(val);
                        setPage(0);
                    }}
                    totalCount={count}
                    loading={loading}
                />
            </div>
            {showNewPromo && (
                <NewPromotionPopup
                    show={showNewPromo}
                    onClose={() => setShowNewPromo(false)}
                    onCreated={() => {
                        setPage(0);
                        setRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    </div>;
}

export default AllPromotions;
