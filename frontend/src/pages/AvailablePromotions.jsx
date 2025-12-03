import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AvailablePromotions.module.css";
import PromotionsTable from "../components/Tables/PromotionsTable";
import { getPromotions } from "../api/getPromotionsApi";
import React, { useState, useEffect } from "react";

function AvailablePromotions() {

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
                <PromotionsTable promoTableTitle={"Available Promotions"} availableOnlyBool={true} promotions={promotions}/>
            </div>
        </div>
    </div>;
}

export default AvailablePromotions;