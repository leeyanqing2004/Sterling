import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./PublishedEvents.module.css";
import EventsTable from "../components/Tables/EventsTable";

function PublishedEvents() {
    return <div className={styles.pubEventsPageContainer}>

        {/* top Nav container */}
        <div className={styles.pubEventsNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.pubEventsLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.pubEventsleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.pubEventsTableContainer}>
                <EventsTable eventsTableTitle={"Published Events"} managerViewBool={false}/>
            </div>
        </div>
    </div>;
}

export default PublishedEvents;