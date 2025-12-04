import styles from "./PublishedEvents.module.css";
import EventsTable from "../components/Tables/EventsTable";

function PublishedEvents() {
    return (
        <div className={styles.pubEventsTableContainer}>
            <EventsTable eventsTableTitle={"Published Events"} managerViewBool={false}/>
        </div>
    );
}

export default PublishedEvents;
