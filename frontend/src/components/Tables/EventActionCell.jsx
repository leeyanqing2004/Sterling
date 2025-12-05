import React from "react";
import styles from "./EventsTable.module.css";
import { TableCell } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EventActionCell({
    row,
    isManagerOrSuperuser,
    isOrganizerForEvent,
    isRsvped,
    isLoading,
    canRsvp,
    disabledReason,
    onManage,
    onMoreDetails,
    onRsvpToggle,
    showDetails = true,
}) {
    const navigate = useNavigate();
    return (
        <TableCell>
                {isOrganizerForEvent ? (
                    <button
                        className={styles.manageEventBtn}
                        onClick={() => navigate(`/organizer-manage-event/${row.id}`)}
                    >
                        Edit Event
                    </button>
                ) : (
                    <button
                        className={isRsvped ? styles.rsvpBtnSecondary : styles.rsvpBtn}
                        onClick={() => onRsvpToggle(row)}
                        disabled={isLoading || (!isRsvped && !canRsvp)}
                        title={disabledReason || (isRsvped ? "Click to un-RSVP" : "Click to RSVP")}
                    >
                        {isLoading ? "Loading..." : isRsvped ? "Un-RSVP" : "RSVP"}
                    </button>
                )}
        </TableCell>
    );
}
