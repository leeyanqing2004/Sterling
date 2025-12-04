import styles from "./AllTransactions.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getAllTransactions } from "../api/getTransactionsApi";
import React, { useState, useEffect } from "react";

function AllTransactions() {

    const [allTransactions, setAllTransactions] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            const data = await getAllTransactions({ limit: 10000 });
            setAllTransactions(data.results);
            setCount(data.count);
        }
        loadData();
    }, []);

    return (
        <div className={styles.allTransactionsTableContainer}>
            <TransactionTable transTableTitle={"All Transactions"} includeManageButton={true} recentOnlyBool={false} transactions={allTransactions} />
        </div>
    );
}

export default AllTransactions;
