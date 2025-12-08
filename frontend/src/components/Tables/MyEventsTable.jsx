import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Box, Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./EventsTable.module.css";
import { formatDateTime } from "../../utils/formatDateTime";
import EventActionCell from "./EventActionCell";

export default function MyEventsTable({ title = "My Events" }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [rsvps, setRsvps] = useState({});
    const [loadingRsvp, setLoadingRsvp] = useState({});
    const [organizerEvents, setOrganizerEvents] = useState({});
    const [loading, setLoading] = useState(false);
    const [rsvpLoaded, setRsvpLoaded] = useState(false);

    const updateStatuses = useCallback(async (eventList) => {
        if (!user || !Array.isArray(eventList) || !eventList.length) return;
        // Managers/superusers see all rows; they don't need organizer status to show "Manage"
        if (isManagerOrSuperuser) {
            setOrganizerEvents({});
            return;
        }
        try {
            const orgMap = {};
            // Lightweight fetch per row for organizer status only
            const details = await Promise.all(
                eventList.map((event) =>
                    api.get(`/events/${event.id}`).then(r => r.data).catch(() => null)
                )
            );
            details.forEach((detail, idx) => {
                const id = eventList[idx].id;
                if (!detail) return;
                const isOrganizer = detail.organizers?.some(o => o.utorid === user.utorid);
                if (isOrganizer) orgMap[id] = true;
            });
            setOrganizerEvents(orgMap);
        } catch (err) {
            console.error("Failed to update organizer statuses", err);
            setOrganizerEvents({});
        }
    }, [user, isManagerOrSuperuser]);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = { page: page + 1, limit: rowsPerPage };
                if (filter) params.name = filter;

                const response = await api.get("/events", { params });
                const events = response.data.results || [];
                setRows(events);
                setTotalCount(response.data.count || events.length);
                await updateStatuses(events);
            } catch (err) {
                console.error(err);
                setRows([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [page, rowsPerPage, filter, updateStatuses]);

    // Fetch RSVPs once
    useEffect(() => {
        const fetchRsvps = async () => {
            setRsvpLoaded(false);
            try {
                const rsvpRes = await api.get("/users/me/guests");
                const eventIds = rsvpRes.data.eventIds || [];
                const nextMap = {};
                eventIds.forEach((id) => { nextMap[id] = true; });
                setRsvps((prev) => ({ ...prev, ...nextMap }));
            } catch (rsvpErr) {
                console.error("Failed to fetch RSVP status", rsvpErr);
            } finally {
                setRsvpLoaded(true);
            }
        };
        fetchRsvps();
    }, []);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
    useEffect(() => { setPage(0); }, [filter, sortBy]);

    const handleRsvpToggle = async (event) => {
        const eventId = event.id;
        const isRsvped = Boolean(rsvps[eventId]);
        const now = new Date();
        const endTime = new Date(event.endTime);
        if (now > endTime) return; // silently ignore in this table
        const isFull = event.capacity !== null && event.numGuests >= event.capacity;
        if (!isRsvped && isFull) return;
        setLoadingRsvp(prev => ({ ...prev, [eventId]: true }));
        try {
            if (isRsvped) {
                await api.delete(`/events/${eventId}/guests/me`);
                setRsvps(prev => ({ ...prev, [eventId]: false }));
                setRows(prev => prev.map(r => r.id === eventId ? { ...r, numGuests: Math.max(0, r.numGuests - 1) } : r));
            } else {
                const response = await api.post(`/events/${eventId}/guests/me`);
                setRsvps(prev => ({ ...prev, [eventId]: true }));
                setRows(prev => prev.map(r => r.id === eventId ? { ...r, numGuests: response.data.numGuests || r.numGuests + 1 } : r));
            }
        } finally {
            setLoadingRsvp(prev => ({ ...prev, [eventId]: false }));
        }
    };

    const myRows = rows.filter(row => Boolean(rsvps[row.id]) || Boolean(organizerEvents[row.id]) || isManagerOrSuperuser);
    const processedRows = (() => {
        const arr = [...myRows].filter((row) =>
            (row.name || "").toLowerCase().includes(filter.toLowerCase())
        );
        if (sortBy === "id") return arr.sort((a, b) => a.id - b.id);
        if (sortBy === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
        return arr;
    })();
    const countForPagination = processedRows.length;
    const rangeStart = countForPagination === 0 ? 0 : page * rowsPerPage + 1;
    const rangeEnd = countForPagination === 0 ? 0 : Math.min(countForPagination, page * rowsPerPage + rowsPerPage);
    const rangeLabel = (() => {
        if (countForPagination === 0) return "0 of 0";
        if (countForPagination === 1) return "1 of 1";
        return `${rangeStart}-${rangeEnd} of ${countForPagination}`;
    })();

    return (
        <div className={styles.eventsTableContainer}>
            <div className={styles.eventsTableTitle}>{title}</div>
            <Box display="flex" gap={2} mb={2}>
                <TextField label="Filter by event name" variant="outlined" size="small" value={filter} onChange={(e) => setFilter(e.target.value)} />
                <FormControl size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: 150 }}>
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="id">ID</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
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
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
            {loading && processedRows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8}>
                        <div className={styles.tableLoading}>
                            <div className={styles.spinner} />
                            <span>Loading events...</span>
                        </div>
                    </TableCell>
                </TableRow>
            ) : (!loading && !rsvpLoaded) ? (
                <TableRow>
                    <TableCell colSpan={8}>
                        <div className={styles.tableLoading}>
                            <div className={styles.spinner} />
                            <span>Loading RSVPs...</span>
                        </div>
                    </TableCell>
                </TableRow>
            ) : !loading && processedRows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8}>
                        <div className={styles.tableLoading}><span>No events to display.</span></div>
                    </TableCell>
                </TableRow>
                            ) : (
                                processedRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                    const isRsvped = Boolean(rsvps[row.id]);
                                        const isLoading = Boolean(loadingRsvp[row.id]);
                                        const now = new Date();
                                        const endTime = new Date(row.endTime);
                                        const isEnded = now > endTime;
                                        const isFull = row.capacity !== null && row.numGuests >= row.capacity;
                                        const isOrganizerForEvent = Boolean(organizerEvents[row.id]);
                                        const canRsvp = !isEnded && (!isFull || isRsvped) && !isOrganizerForEvent;
                                        let disabledReason = "";
                                        if (isEnded) disabledReason = "Event Ended";
                                        else if (isFull && !isRsvped) disabledReason = "Event Full";
                                        else if (isOrganizerForEvent) disabledReason = "Organizers cannot RSVP";
                                        const disabled = isLoading || isEnded || (!isRsvped && !canRsvp);

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.location}</TableCell>
                                            <TableCell>{formatDateTime(row.startTime)}</TableCell>
                                            <TableCell>{formatDateTime(row.endTime)}</TableCell>
                                            <TableCell>{row.numGuests}</TableCell>
                                            <EventActionCell
                                                row={row}
                                                isManagerOrSuperuser={isManagerOrSuperuser}
                                                isOrganizerForEvent={isOrganizerForEvent}
                                                isRsvped={isRsvped}
                                                isEnded={isEnded}
                                                isLoading={isLoading}
                                                canRsvp={canRsvp}
                                                disabledReason={disabledReason}
                                                disabled={disabled}
                                                onRsvpToggle={handleRsvpToggle}
                                            />
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className={styles.tablePaginationBar}>
                    <div className={styles.rangeInfo}>
                        {rangeLabel}
                    </div>
                    <Pagination
                        count={Math.max(1, Math.ceil((processedRows.length || 1) / rowsPerPage))}
                        page={page + 1}
                        onChange={(_, val) => handleChangePage(null, val - 1)}
                        siblingCount={1}
                        boundaryCount={1}
                        disabled={false}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="my-events-rows-label">Rows</InputLabel>
                        <Select labelId="my-events-rows-label" value={rowsPerPage} label="Rows" onChange={handleChangeRowsPerPage}>
                            {[5, 10, 25, 50].map(opt => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
        </div>
    );
}
