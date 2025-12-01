import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AllTransactions.module.css";
import TransactionTable from "../components/Tables/TransactionTable";
import { getAllTransactions } from "../api/getTransactionsApi";
import React, { useState, useEffect } from "react";

function PastTransactions() {

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

    return <div className={styles.allTransactionsPageContainer}>

        {/* top Nav container */}
        <div className={styles.allTransactionsNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.allTransactionsLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.allTransactionsleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.allTransactionsTableContainer}>
                <TransactionTable transTableTitle={"All Transactions"} includeManageButton={true} recentOnlyBool={false} transactions={allTransactions} />;
            </div>
        </div>
    </div>;
}

export default PastTransactions;