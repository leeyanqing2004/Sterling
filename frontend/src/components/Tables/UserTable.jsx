import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";
import styles from "./UserTable.module.css"
import ManageUserPopup from "../ManageUserPopup";
import { capitalize } from "../../utils/capitalize";
  
export default function UserTable({ userTableTitle }) {
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [activeUser, setActiveUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await api.get("/users", { params: { limit: 1000 } });
                const data = res.data?.results ?? res.data ?? [];
                setRows(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err?.response?.data?.error || "Failed to load users");
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
  
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
    // FILTER
    .filter((row) =>
        (row.name || "").toLowerCase().includes(filter.toLowerCase()) ||
        (row.utorid || "").toLowerCase().includes(filter.toLowerCase())
    )
    // SORT
    .sort((a, b) => {
        if (!sortBy) {
            return 0;
        } else if (sortBy === "id") {
            return a.id - b.id;
        } else if (sortBy === "points") {
            return a.points - b.points;
        } else if (sortBy === "utorid") {
            return a.utorid.localeCompare(b.utorid);
        } else if (sortBy === "role") {
            return a.role.localeCompare(b.role);
        } else if (sortBy === "name") {
            return a.name.localeCompare(b.name);
        } else {
            return 0;
        }
    });

    const formatDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString();
    };
  
    return (
        <>
        <div className={styles.userTableContainer}>
            <div className={styles.userTableTitle}>{userTableTitle}</div>
            <Box display="flex" gap={2} mb={2}>
                {/* Filter Input */}
                <TextField
                    label="Filter by UTORid"
                    variant="outlined"
                    size="small"
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        setPage(0);
                    }}
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
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="utorid">UTORid</MenuItem>
                        <MenuItem value="role">Role</MenuItem>
                        <MenuItem value="points">Points</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Paper>
                <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Birthday</TableCell>
                        <TableCell>Points</TableCell>
                        <TableCell>Verified</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    </TableHead>
        
                    <TableBody>
                    {(loading ? [] : processedRows)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{capitalize(row.role)}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{formatDate(row.birthday)}</TableCell>
                            <TableCell>{row.points}</TableCell>
                            <TableCell>{row.verified ? "Yes" : "No"}</TableCell>
                            <TableCell>{formatDate(row.createdAt)}</TableCell>
                            <TableCell>{formatDate(row.lastLogin)}</TableCell>
                            <TableCell>
                                <button
                                    className={styles.manageBtn}
                                    onClick={() => setActiveUser(row)}
                                >
                                    Manage User
                                </button>
                            </TableCell>
                        </TableRow>
                        ))}
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={10} className={styles.userTableEmpty}>Loading...</TableCell>
                        </TableRow>
                    )}
                    {!loading && processedRows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={10} className={styles.userTableEmpty}>{error || "No users found"}</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </TableContainer>
        
                <TablePagination
                    component="div"
                    count={processedRows.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
        {activeUser && (
            <ManageUserPopup
                show={!!activeUser}
                user={activeUser}
                onClose={() => setActiveUser(null)}
                onUserUpdate={(updatedUser) => {
                    setActiveUser(updatedUser);
                    setRows(rows.map(r => r.id === updatedUser.id ? updatedUser : r));
                }}
            />
        )}
    </>
    );
}
  
