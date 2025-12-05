import styles from "./AllEvents.module.css";
import EventsTable from "../components/Tables/EventsTable";
import React, { useState } from "react";
import NewEventPopup from "../components/Popups/NewEventPopup";

function AllEvents() {
    const [showNewEvent, setShowNewEvent] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className={styles.allEventsTableContainer}>
            <div className={styles.allEventsTableTopContainer}>
                <button
                    className={styles.allEventsTableTopContainerButton}
                    onClick={() => setShowNewEvent(true)}
                >
                    + Create New Event
                </button>
            </div>
            {showNewEvent && (
                <NewEventPopup
                    show={showNewEvent}
                    onClose={() => setShowNewEvent(false)}
                    onCreated={() => {
                        setRefreshKey((k) => k + 1);
                    }}
                />
            )}

            <div className={styles.allEventsTableBottomContainer}>
                <EventsTable
                    key={refreshKey}
                    eventsTableTitle={"All Events"}
                    managerViewBool={true}
                />
            </div>
        </div>
    );
}

export default AllEvents;
