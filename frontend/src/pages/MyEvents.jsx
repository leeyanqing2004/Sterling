import styles from "./AllEvents.module.css";
import MyEventsTable from "../components/Tables/MyEventsTable";

function MyEvents() {
    return (
        <div className={styles.allEventsTableContainer}>
            <div className={styles.allEventsTableBottomContainer}>
                <EventsTable
                    eventsTableTitle={"My Events"}
                    managerViewBool={false}
                    showRegisteredOnly={true}
                    showOrganizerEvents={true}
                    showPastEvents={true}
                />
            </div>
        </div>
    );
}

export default MyEvents;
