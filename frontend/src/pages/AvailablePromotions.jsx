import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AvailablePromotions.module.css";
import PromotionsTable from "../components/Tables/PromotionsTable";
import { getPromotions } from "../api/getPromotionsApi";
import React, { useState, useEffect } from "react";

function AvailablePromotions() {

    const [promotions, setPromotions] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
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

    return <div className={styles.availPromoPageContainer}>

        {/* top Nav container */}
        <div className={styles.availPromoNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.availPromoLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.availPromoleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.availPromoTableContainer}>
                <PromotionsTable
                    promoTableTitle={"Available Promotions"}
                    availableOnlyBool={true}
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

export default AvailablePromotions;
