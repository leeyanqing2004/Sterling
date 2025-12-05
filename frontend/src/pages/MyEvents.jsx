import styles from "./AllEvents.module.css";
import MyEventsTable from "../components/Tables/MyEventsTable";

function MyEvents() {
    return (
        <div className={styles.allEventsTableContainer}>
            <div className={styles.allEventsTableBottomContainer}>
                <MyEventsTable title={"My Events"} />
            </div>
        </div>
    );
}

export default MyEvents;
