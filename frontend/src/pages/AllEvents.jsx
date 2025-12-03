import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AllEvents.module.css";
import EventsTable from "../components/Tables/EventsTable";

function AllEvents() {
    return <div className={styles.allEventsPageContainer}>

        {/* top Nav container */}
        <div className={styles.allEventsNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.allEventsLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.allEventsleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.allEventsTableContainer}>
                <div className={styles.allEventsTableTopContainer}>
                    <button className={styles.allEventsTableTopContainerButton}>+ Create New Event</button>
                </div>
                <div className={styles.allEventsTableBottomContainer}>
                    <EventsTable eventsTableTitle={"All Events"} managerViewBool={true}/>
                </div>
            </div>
        </div>
    </div>;
}

export default AllEvents;