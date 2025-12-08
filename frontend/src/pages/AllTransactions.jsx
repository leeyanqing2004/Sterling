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
    const [idFilter, setIdFilter] = useState("");
    const [createdByFilter, setCreatedByFilter] = useState("");
    const [utoridFilter, setUtoridFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const loadTransactions = async () => {
        setLoading(true);
        setAllTransactions([]);
        setCount(0);
        const idParam = idFilter && Number(idFilter) > 0 ? Number(idFilter) : undefined;
        try {
            // If user entered a non-numeric ID, short-circuit as "not found"
            if (idFilter && idParam === undefined) {
                return;
            }
            const data = await getAllTransactions({
                limit: rowsPerPage,
                page: page + 1,
                id: idParam,
                createdBy: createdByFilter || undefined,
                utorid: utoridFilter || undefined,
                type: typeFilter || undefined,
            });
            setAllTransactions(data?.results || []);
            setCount(data?.count || 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [page, rowsPerPage, idFilter, createdByFilter, utoridFilter, typeFilter]);

    const handleTransactionUpdate = (updatedTransaction) => {
        // If we have the updated transaction, update it in the local state immediately
        if (updatedTransaction) {
            setAllTransactions(prev => 
                prev.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx)
            );
        }
        // Also reload from server to ensure we have the latest data
        loadTransactions();
    };

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
                onTransactionUpdate={handleTransactionUpdate}
                idFilter={idFilter}
                onIdFilterChange={(val) => {
                    setIdFilter(val);
                    setPage(0);
                }}
                createdByFilter={createdByFilter}
                onCreatedByFilterChange={(val) => {
                    setCreatedByFilter(val);
                    setPage(0);
                }}
                utoridFilter={utoridFilter}
                onUtoridFilterChange={(val) => {
                    setUtoridFilter(val);
                    setPage(0);
                }}
                typeFilter={typeFilter}
                onTypeFilterChange={(val) => {
                    setTypeFilter(val);
                    setPage(0);
                }}
            />
        </div>
    );
}

export default AllTransactions;
