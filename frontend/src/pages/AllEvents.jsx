import styles from "./AllEvents.module.css";
import EventsTable from "../components/Tables/EventsTable";

function AllEvents() {
    return (
        <div className={styles.allEventsTableContainer}>
            <div className={styles.allEventsTableTopContainer}>
                <button className={styles.allEventsTableTopContainerButton}>+ Create New Event</button>
            </div>
            <div className={styles.allEventsTableBottomContainer}>
                <EventsTable eventsTableTitle={"All Events"} managerViewBool={true}/>
            </div>
        </div>
    );
}

export default AllEvents;
