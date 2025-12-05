import styles from "./AllEvents.module.css";
import EventsTable from "../components/Tables/EventsTable";

function MyEvents() {
    return (
        <div className={styles.allEventsTableContainer}>
            <div className={styles.allEventsTableBottomContainer}>
                <EventsTable eventsTableTitle={"My Events"} managerViewBool={true} showRegisteredOnly={true}/>
            </div>
        </div>
    );
}

export default MyEvents;
