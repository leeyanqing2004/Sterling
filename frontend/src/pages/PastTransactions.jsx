import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
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

    return <div className={styles.pastTransactionsPageContainer}>

        {/* top Nav container */}
        <div className={styles.pastTransactionsNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.pastTransactionsLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.pastTransactionsleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.pastTransactionsTableContainer}>
                <TransactionTable 
                transTableTitle={"Past Transactions"} 
                includeManageButton={false} 
                recentOnlyBool={false}
                transactions={pastTransactions}
                />
            </div>
        </div>
    </div>;
}

export default PastTransactions;