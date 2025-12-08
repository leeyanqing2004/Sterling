import React from "react";
import styles from "./EventsTable.module.css";
import { TableCell } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EventActionCell({
    row,
    isManagerOrSuperuser,
    isOrganizerForEvent,
    isRsvped,
    isEnded = false,
    isLoading,
    disabled = false,
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
                {isManagerOrSuperuser ? (
                    <button
                        className={styles.manageEventBtn}
                        onClick={() => navigate(`/manage-event/${row.id}`)}
                    >
                        Manage Event
                    </button>
                ) : isOrganizerForEvent ? (
                    <button
                        className={styles.manageEventBtn}
                        onClick={() => navigate(`/organizer-manage-event/${row.id}`)}
                    >
                        Manage Event
                    </button>
                ) : (
                    <button
                        className={
                            isEnded
                                ? styles.rsvpBtnSecondary
                                : isRsvped
                                    ? styles.rsvpBtnSecondary
                                    : styles.rsvpBtn
                        }
                        onClick={() => onRsvpToggle(row)}
                        disabled={disabled || isLoading || (!isRsvped && !canRsvp)}
                        title={disabledReason || (isRsvped ? "Click to un-RSVP" : "Click to RSVP")}
                    >
                        {isLoading
                            ? "Loading..."
                            : isEnded
                                ? "Event Ended"
                                : disabledReason || (isRsvped ? "Un-RSVP" : "RSVP")}
                    </button>
                )}
        </TableCell>
    );
}
