import styles from "./PastTransactions.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getMyTransactions } from "../api/getTransactionsApi";
import React, { useState, useEffect } from "react";

function PastTransactions() {
    const [pastTransactions, setPastTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getMyTransactions({ limit: rowsPerPage, page: page + 1 });
                setPastTransactions(data?.results || []);
                setCount(data?.count || 0);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, rowsPerPage]);

    return <div className={styles.pastTransactionsTableContainer}>
        <TransactionTable 
        transTableTitle={"Past Transactions"} 
        includeManageButton={false} 
        recentOnlyBool={false}
        transactions={pastTransactions}
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
    </div>;
}

export default PastTransactions;
