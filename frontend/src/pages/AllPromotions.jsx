import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AllPromotions.module.css";
import PromotionsTable from "../components/Tables/PromotionsTable";
import { getPromotions } from "../api/getPromotionsApi";
import React, { useState, useEffect } from "react";

function AllPromotions() {

    const [promotions, setPromotions] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0); // 0-based for UI
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getPromotions({ limit: rowsPerPage, page: page + 1 });
                setPromotions(data?.results || []);
                setCount(data?.count || 0);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, rowsPerPage]);
    
    return <div className={styles.allPromoPageContainer}>

        {/* top Nav container */}
        <div className={styles.allPromoNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.allPromoLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.allPromoleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.allPromoTableContainer}>
                <PromotionsTable
                    promoTableTitle={"All Promotions"}
                    availableOnlyBool={false}
                    promotions={promotions}
                    serverPaging
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
                {loading && <div className={styles.loadingText}>Loading...</div>}
            </div>
        </div>
    </div>;
}

export default AllPromotions;
