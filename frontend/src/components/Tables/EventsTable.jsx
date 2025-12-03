import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api/api";
import styles from "./EventsTable.module.css";

const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};
  
export default function EventsTable({ eventsTableTitle, managerViewBool }) {
    // this is make a fake table with 50 rows, just to see
    // const rows = Array.from({ length: 50 }, (_, i) => ({
    //     id: i + 1,
    //     name: "[Event Name]",
    //     location: "[Event Location]",
    //     startTime: "[Start Time]",
    //     endTime: "[End Time]",
    //     capacity: "[e.g. 200]",
    //     numGuests: "[e.g. 7]",
    //     pointsRemain: "[e.g. 500]",
    //     pointsAwarded: "[e.g. 10]",
    //     published: "[e.g. false]"
    // }));
  
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [rsvps, setRsvps] = useState({});

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const params = {
                    page: page + 1,
                    limit: rowsPerPage,
                }

                if (filter) {
                    params.name = filter;
                }

                if (!managerViewBool) {
                    params.published = "true";
                }

                const response = await api.get("/events", {
                    params: params
                });
                setRows(response.data.results || []);
                setTotalCount(response.data.count || 0);
            } catch (err) {
                console.error(err);
                setRows([]);
                setTotalCount(0);
            }
        };
        fetchEvents();
    }, [page, rowsPerPage, filter, managerViewBool]);
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
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
                {/* Filter Input */}
                <TextField
                    label="Filter by event name"
                    variant="outlined"
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />

                {/* Sort Dropdown */}
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
                                <button className={styles.manageEventBtn}>Manage Event</button>
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    const isRsvped = Boolean(rsvps[row.id]);
                                    return (
                                        <button
                                            className={
                                                isRsvped
                                                    ? styles.rsvpBtnSecondary
                                                    : styles.rsvpBtn
                                            }
                                            onClick={() =>
                                                setRsvps((prev) => ({
                                                    ...prev,
                                                    [row.id]: !isRsvped,
                                                }))
                                            }
                                        >
                                            {isRsvped ? "Un-RSVP" : "RSVP"}
                                        </button>
                                    );
                                })()}
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
        </div>
    );
}
  
