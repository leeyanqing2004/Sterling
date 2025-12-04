import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination, TextField, FormControl,
    InputLabel, Select, MenuItem, Box
} from "@mui/material";
import api from "../../api/api";
import styles from "./EventsTable.module.css";
import "../Popups/DetailsPopup.css";
import EventDetailsPopup from "../Popups/EventDetailsPopup";

export default function EventsTable({ eventsTableTitle, managerViewBool }) {
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rsvpedEventIds, setRsvpedEventIds] = useState(new Set());

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const params = {
                    page: page + 1,
                    limit: rowsPerPage,
                };
                if (filter) params.name = filter;
                if (!managerViewBool) params.published = "true";

                // Fetch events
                const response = await api.get("/events", { params });
                const events = response.data.results || [];
                setRows(events);
                setTotalCount(response.data.count || 0);

                // Fetch RSVP status for all events in one call
                const rsvpRes = await api.get("/users/me/guests");
                const eventIds = rsvpRes.data.eventIds || [];
                setRsvpedEventIds(new Set(eventIds));
            } catch (err) {
                console.error(err);
                setRows([]);
                setTotalCount(0);
                setRsvpedEventIds(new Set());
            }
        };
        fetchEvents();
    }, [page, rowsPerPage, filter, managerViewBool]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleMoreDetails = (event) => {
        setSelectedEvent(event); // Set the selected event for the popup
    };

    const handleClosePopup = () => {
        setSelectedEvent(null); // Close the popup
    };

    const handleRsvp = async (eventId) => {
        try {
            // use /me so backend uses the logged-in user (no utorid in body)
            await api.post(`/events/${eventId}/guests/me`);
            // mark as RSVPed
            setRsvpedEventIds(prev => {
                const next = new Set(prev);
                next.add(eventId);
                return next;
            });
            // update displayed numGuests for that row
            setRows(prev => prev.map(r => r.id === eventId ? { ...r, numGuests: (r.numGuests ?? 0) + 1 } : r));
        } catch (error) {
            console.error("Failed to RSVP:", error.response?.data || error.message);
        }
    };

    const handleUnRsvp = async (eventId) => {
        try {
            await api.delete(`/events/${eventId}/guests/me`);
            setRsvpedEventIds(prev => {
                const next = new Set(prev);
                next.delete(eventId);
                return next;
            });
            setRows(prev => prev.map(r => r.id === eventId ? { ...r, numGuests: Math.max((r.numGuests ?? 1) - 1, 0) } : r));
        } catch (error) {
            console.error("Failed to Un-RSVP:", error.response?.data || error.message);
        }
    };

    const processedRows = rows
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
                        <MenuItem value="utorid">Utorid</MenuItem>
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
                                        <TableCell>{row.startTime}</TableCell>
                                        <TableCell>{row.endTime}</TableCell>
                                        <TableCell>{row.numGuests}</TableCell>
                                        {managerViewBool && <TableCell>{row.capacity}</TableCell>}
                                        {managerViewBool && <TableCell>{row.pointsRemain}</TableCell>}
                                        {managerViewBool && <TableCell>{row.pointsAwarded}</TableCell>}
                                        {managerViewBool && <TableCell>{row.published}</TableCell>}
                                        <TableCell>
                                            <button
                                                className={styles.moreDetailsBtn}
                                                onClick={() => handleMoreDetails(row)}
                                            >
                                                More Details
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            {!rsvpedEventIds.has(row.id) && (
                                                <button
                                                    className={`action-btn`}
                                                    style={{ width: "7em" }}
                                                    onClick={() => handleRsvp(row.id)}
                                                    disabled={row.capacity !== null && row.numGuests >= row.capacity}
                                                >
                                                    RSVP
                                                </button>
                                            )}
                                            {rsvpedEventIds.has(row.id) && (
                                                <button
                                                    className={`unrsvp-btn`}
                                                    style={{ width: "7em" }}
                                                    onClick={() => handleUnRsvp(row.id)}
                                                >
                                                    Un-RSVP
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            {selectedEvent && (
                <EventDetailsPopup
                    event={selectedEvent}
                    rsvped={rsvpedEventIds.has(selectedEvent.id)}
                    onClose={handleClosePopup}
                    onRsvp={() => handleRsvp(selectedEvent.id)}
                    onUnRsvp={() => handleUnRsvp(selectedEvent.id)}
                />
            )}
        </div>
    );
}
