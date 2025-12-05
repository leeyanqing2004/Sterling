import styles from "./AllTransactions.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getAllTransactions } from "../api/getTransactionsApi";
import React, { useState, useEffect } from "react";

function AllTransactions() {
    const [allTransactions, setAllTransactions] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getAllTransactions({ limit: rowsPerPage, page: page + 1 });
                setAllTransactions(data?.results || []);
                setCount(data?.count || 0);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, rowsPerPage]);

    return (
        <div className={styles.allTransactionsTableContainer}>
            <TransactionTable
                transTableTitle={"All Transactions"}
                includeManageButton={true}
                recentOnlyBool={false}
                transactions={allTransactions}
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
    );
}

export default AllTransactions;
