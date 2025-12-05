import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AllPromotions.module.css";
import PromotionsTable from "../components/Tables/PromotionsTable";
import { getPromotions } from "../api/getPromotionsApi";
import React, { useState, useEffect } from "react";

function AllPromotions() {

    const [promotions, setPromotions] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            const data = await getPromotions({ limit: 10000 });
            setPromotions(data.results);
            setCount(data.count);
        }
        loadData();
    }, []);
    
    return <div className={styles.allPromoPageContainer}>
        {/* everything under the top Nav container */}
        <div className={styles.allPromoLeftNavAndTableContainer}>
            {/* everything to the right of the left Nav container */}
            <div className={styles.allPromoTableContainer}>
                <PromotionsTable promoTableTitle={"All Promotions"} availableOnlyBool={false} promotions={promotions}/>
            </div>
        </div>
    </div>;
}

export default AllPromotions;