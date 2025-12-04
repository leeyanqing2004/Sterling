import styles from "./PastTransactions.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getMyTransactions } from "../api/getTransactionsApi";
import React, { useState, useEffect } from "react";

function PastTransactions() {

    const [filters, setFilters] = useState({
        type: "",
        relatedId: "",
        promotionId: "",
        amount: "",
        operator: "",
        page: 1,
        limit: 10
    });

    const [pastTransactions, setPastTransactions] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            const data = await getMyTransactions({ limit: 10000 });
            setPastTransactions(data.results);
            setCount(data.count);
        }
        loadData();
    }, []);

    return <div className={styles.pastTransactionsTableContainer}>
        <TransactionTable 
        transTableTitle={"Past Transactions"} 
        includeManageButton={false} 
        recentOnlyBool={false}
        transactions={pastTransactions}
        />
    </div>;
}

export default PastTransactions;
