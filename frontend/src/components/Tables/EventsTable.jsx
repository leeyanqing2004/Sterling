import { useState, useEffect, useCallback } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination, TextField, FormControl,
    InputLabel, Select, MenuItem, Box, Pagination
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./EventsTable.module.css";
import "../Popups/DetailsPopup.css";
import EventDetailsPopup from "../Popups/EventDetailsPopup";;

const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};
  
export default function EventsTable({ eventsTableTitle, managerViewBool, showRegisteredOnly = false }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [rsvps, setRsvps] = useState({});
    const [loadingRsvp, setLoadingRsvp] = useState({});
    const [toast, setToast] = useState(null);
    const [organizerEvents, setOrganizerEvents] = useState({});
    const [guestStatusChecked, setGuestStatusChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check for success message from navigation state
    const updateOrganizerStatus = useCallback(async (eventList) => {
        if (!user || isManagerOrSuperuser || !Array.isArray(eventList) || !eventList.length) {
            return;
        }
        try {
            const statusPairs = await Promise.all(
                eventList.map(async (event) => {
                    try {
                        const detail = await api.get(`/events/${event.id}`);
                        const isOrganizer = detail.data.organizers?.some(
                            (o) => o.utorid === user.utorid
                        );
                        return { id: event.id, isOrganizer: Boolean(isOrganizer) };
                    } catch {
                        return { id: event.id, isOrganizer: false };
                    }
                })
            );
            const map = {};
            statusPairs.forEach(({ id, isOrganizer }) => {
                if (isOrganizer) map[id] = true;
            });
            setOrganizerEvents(map);
        } catch (err) {
            console.error("Failed to check organizer status", err);
        }
    }, [user, isManagerOrSuperuser]);

    const updateGuestStatus = useCallback(async (eventList) => {
        if (!user || !Array.isArray(eventList) || !eventList.length) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const statusPairs = await Promise.all(
                eventList.map(async (event) => {
                    try {
                        const detail = await api.get(`/events/${event.id}`);
                        const isGuest = detail.data.guests?.some(
                            (g) => g.utorid === user.utorid
                        );
                        return { id: event.id, isGuest: Boolean(isGuest) };
                    } catch {
                        return { id: event.id, isGuest: false };
                    }
                })
            );
            const map = {};
            statusPairs.forEach(({ id, isGuest }) => {
                if (isGuest) map[id] = true;
            });
            setRsvps(map);
        } catch (err) {
            console.error("Failed to check RSVP status", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (location.state?.success) {
            setToast({ message: location.state.success, type: "success" });
            // Clear the state so it doesn't show again on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        if (showRegisteredOnly) {
            setPage(0);
        }
    }, [showRegisteredOnly]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rsvpedEventIds, setRsvpedEventIds] = useState(new Set());

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = {
                    page: page + 1,
                    limit: rowsPerPage,
                };

                if (filter) {
                    params.name = filter;
                }

                if (!managerViewBool) {
                    params.published = "true";
                }

                const response = await api.get("/events", {
                    params: params
                });
                const events = response.data.results || [];
                setRows(events);
                setTotalCount(response.data.count || 0);
                // Refresh organizer and RSVP status for current page
                updateOrganizerStatus(events);
                updateGuestStatus(events);

                // Fetch RSVP status for all events in one call
                const rsvpRes = await api.get("/users/me/guests");
                const eventIds = rsvpRes.data.eventIds || [];
                setRsvpedEventIds(new Set(eventIds));
            } catch (err) {
                console.error(err);
                setRows([]);
                setTotalCount(0);
                setRsvpedEventIds(new Set());
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [page, rowsPerPage, filter, managerViewBool, showRegisteredOnly, updateOrganizerStatus, updateGuestStatus]);
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleRsvp = async (event) => {
        const eventId = event.id;
        const isRsvped = Boolean(rsvps[eventId]);
        const now = new Date();
        const endTime = new Date(event.endTime);

        // Check if event has ended
        if (now > endTime) {
            setToast({ message: "Cannot RSVP to events that have ended", type: "error" });
            return;
        }

        // Check if event is full (only when trying to RSVP)
        if (!isRsvped && event.capacity !== null && event.numGuests >= event.capacity) {
            setToast({ message: "This event is full", type: "error" });
            return;
        }

        setLoadingRsvp((prev) => ({ ...prev, [eventId]: true }));

        try {
            if (isRsvped) {
                // Un-RSVP: DELETE request
                await api.delete(`/events/${eventId}/guests/me`);
                setRsvps((prev) => ({ ...prev, [eventId]: false }));
                setRsvpedEventIds((prev) => {
                    const next = new Set(prev);
                    next.delete(eventId);
                    return next;
                });
                setRows((prevRows) =>
                    prevRows.map((r) =>
                        r.id === eventId ? { ...r, numGuests: Math.max(0, r.numGuests - 1) } : r
                    )
                );
                setToast({ message: "Successfully Un-RSVP'd from event", type: "success" });
            } else {
                // RSVP: POST request
                const response = await api.post(`/events/${eventId}/guests/me`);
                setRsvps((prev) => ({ ...prev, [eventId]: true }));
                setRsvpedEventIds((prev) => {
                    const next = new Set(prev);
                    next.add(eventId);
                    return next;
                });
                setRows((prevRows) =>
                    prevRows.map((r) =>
                        r.id === eventId
                            ? { ...r, numGuests: response.data.numGuests || r.numGuests + 1 }
                            : r
                    )
                );
                setToast({ message: "Successfully RSVP'd to event", type: "success" });
            }
        } catch (err) {
            const status = err.response?.status;
            const errorMsg = err.response?.data?.error || "Failed to update RSVP";

            if (status === 410) {
                if (now > endTime) {
                    setToast({ message: "Cannot RSVP to events that have ended", type: "error" });
                } else {
                    setToast({ message: "This event is full", type: "error" });
                }
            } else if (status === 400) {
                setToast({ message: "Already RSVP'd to this event", type: "error" });
            } else {
                setToast({ message: errorMsg, type: "error" });
            }
        } finally {
            setLoadingRsvp((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const handleMoreDetails = (event) => {
        setSelectedEvent(event); // Set the selected event for the popup
    };

    const handleClosePopup = () => {
        setSelectedEvent(null); // Close the popup
    };

    // Note: unified RSVP toggle via handleRsvp(event). No duplicate handlers.

    const filteredRows = (showRegisteredOnly && !loading ? rows.filter(row => Boolean(rsvps[row.id])) : rows);
    const processedRows = filteredRows
    // SORT
    .sort((a, b) => {
        if (!sortBy) {
            return 0;
        } else if (sortBy === "id") {
            return a.id - b.id;
        } else if (sortBy === "earned") {
            return a.earned - b.earned;
        } else if (sortBy === "spent") {
            return a.spent - b.spent;
        } else if (sortBy === "utorid") {
            return a.utorid.localeCompare(b.utorid);
        } else {
            return 0;
        }
    });
  
    return (
        <div className={styles.eventsTableContainer}>
            <div className={styles.eventsTableTitle}>{eventsTableTitle}</div>
            <Box display="flex" gap={2} mb={2}>
                <TextField
                    label="Filter by event name"
                    variant="outlined"
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <FormControl size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ minWidth: 150 }}
                    >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="id">ID</MenuItem>
                        <MenuItem value="earned">Points Earned</MenuItem>
                        <MenuItem value="spent">Points Spent</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Paper>
                <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Number of Guests</TableCell>
                        {managerViewBool && <TableCell>Capacity</TableCell>}
                        {managerViewBool && <TableCell>Remaining Points</TableCell>}
                        {managerViewBool && <TableCell>Points Awarded</TableCell>}
                        {managerViewBool && <TableCell>Published</TableCell>}
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        </TableRow>
                        </TableHead>
        
                        <TableBody>
                    {processedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{formatDateTime(row.startTime)}</TableCell>
                            <TableCell>{formatDateTime(row.endTime)}</TableCell>
                            <TableCell>{row.numGuests}</TableCell>

                            {managerViewBool && <TableCell>{row.capacity}</TableCell>}
                            {managerViewBool && <TableCell>{row.pointsRemain}</TableCell>}
                            {managerViewBool && <TableCell>{row.pointsAwarded}</TableCell>}
                            {managerViewBool && <TableCell>{row.published ? "Yes" : "No"}</TableCell>}

                            <TableCell>
                                {(() => {
                                    const isOrganizerForEvent = Boolean(organizerEvents[row.id]);
                                    if (isManagerOrSuperuser || isOrganizerForEvent) {
                                        return (
                                            <button
                                                className={styles.manageEventBtn}
                                                onClick={() => navigate(`/manage-event/${row.id}`)}
                                            >
                                                Manage Event
                                            </button>
                                        );
                                    }
                                    return (
                                        <button
                                            className={styles.moreDetailsBtn}
                                            onClick={() => handleMoreDetails(row)}
                                        >
                                            More Details
                                        </button>
                                    );
                                })()}
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    const isRsvped = Boolean(rsvps[row.id]);
                                    const isLoading = Boolean(loadingRsvp[row.id]);
                                    const now = new Date();
                                    const endTime = new Date(row.endTime);
                                    const isEnded = now > endTime;
                                    const isFull = row.capacity !== null && row.numGuests >= row.capacity;
                                    const isOrganizerForEvent = Boolean(organizerEvents[row.id]);
                                    const canRsvp = !isEnded && (!isFull || isRsvped) && !isOrganizerForEvent;

                                    let disabledReason = "";
                                    if (isEnded) {
                                        disabledReason = "This event has ended";
                                    } else if (isFull && !isRsvped) {
                                        disabledReason = "This event is full";
                                    } else if (isOrganizerForEvent) {
                                        disabledReason = "Organizers cannot RSVP";
                                    }

                                    return (
                                        <button
                                            className={
                                                isRsvped ? styles.rsvpBtnSecondary : styles.rsvpBtn
                                            }
                                            onClick={() => handleRsvp(row)}
                                            disabled={isLoading || (!isRsvped && !canRsvp)}
                                            title={
                                                disabledReason || (isRsvped ? "Click to un-RSVP" : "Click to RSVP")
                                            }
                                        >
                                            {isLoading
                                                ? "Loading..."
                                                : isOrganizerForEvent
                                                    ? "Organizer"
                                                    : isRsvped
                                                        ? "Un-RSVP"
                                                        : isEnded
                                                            ? "Event Ended"
                                                            : isFull && !isRsvped
                                                                ? "Event Full"
                                                                : "RSVP"}
                                        </button>
                                    );
                                })()}
                            </TableCell>
                            
                        </TableRow>
                        ))}
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={managerViewBool ? 11 : 9}>
                                <div className={styles.tableLoading}>
                                    <div className={styles.spinner} />
                                    <span>Loading events...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </TableContainer>
        
                <Box className={styles.tablePaginationBar}>
                    <Pagination
                        count={Math.max(1, Math.ceil(totalCount / rowsPerPage))}
                        page={page + 1}
                        onChange={(_, val) => handleChangePage(null, val - 1)}
                        siblingCount={1}
                        boundaryCount={1}
                        disabled={false}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="events-rows-label">Rows</InputLabel>
                        <Select
                            labelId="events-rows-label"
                            value={rowsPerPage}
                            label="Rows"
                            onChange={handleChangeRowsPerPage}
                        >
                            {[5, 10, 25, 50].map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
            {toast && (
                <div
                    className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess
                        }`}
                >
                    {toast.message}
                </div>
            )}
            {selectedEvent && (
                <EventDetailsPopup
                    event={selectedEvent}
                    rsvped={rsvpedEventIds.has(selectedEvent.id)}
                    onClose={handleClosePopup}
                    onRsvp={() => handleRsvp(selectedEvent)}
                    onUnRsvp={() => handleRsvp(selectedEvent)}
                />
            )}
        </div>
    );
}
