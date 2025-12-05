import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Pagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";
import styles from "./UserTable.module.css"
import ManageUserPopup from "../ManageUserPopup";
import { Capitalize } from "../../utils/capitalize";
import { formatDate, formatDateTime } from "../../utils/formatDateTime";
  
export default function UserTable({ userTableTitle }) {
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [utoridFilter, setUtoridFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [total, setTotal] = useState(0);

    const [activeUser, setActiveUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await api.get("/users", {
                    params: {
                        limit: rowsPerPage,
                        page: page + 1,
                        name: utoridFilter || undefined,
                        role: roleFilter || undefined,
                        verified: verifiedFilter === "yes" ? true : verifiedFilter === "no" ? false : undefined
                    }
                });
                const data = res.data?.results ?? res.data ?? [];
                setRows(Array.isArray(data) ? data : []);
                setTotal(res.data?.count ?? data.length);
            } catch (err) {
                setError(err?.response?.data?.error || "Failed to load users");
                setRows([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, rowsPerPage, utoridFilter, roleFilter, verifiedFilter]);
  
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
    // FILTER
    .filter((row) =>
        ((row.name || "").toLowerCase().includes(utoridFilter.toLowerCase()) ||
        (row.utorid || "").toLowerCase().includes(utoridFilter.toLowerCase())) &&
        row.role.toLowerCase().includes(roleFilter.toLowerCase()) &&
        (verifiedFilter === "" ||
            (verifiedFilter === "yes" && row.verified === true) ||
            (verifiedFilter === "no" && row.verified === false))
    )
    // SORT
    .sort((a, b) => {
        if (!sortBy) {
            return 0;
        } else if (sortBy === "id") {
            return a.id - b.id;
        } else if (sortBy === "points") {
            return b.points - a.points;
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
                    label="Filter by Utorid"
                    variant="outlined"
                    size="small"
                    value={utoridFilter}
                    onChange={(e) => {
                        setUtoridFilter(e.target.value);
                        setPage(0);
                    }}
                />

                <FormControl size="small">
                    <InputLabel>Filter by Role</InputLabel>
                    <Select
                        value={roleFilter}
                        label="Role"
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="regular">Regular</MenuItem>
                        <MenuItem value="cashier">Cashier</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="superuser">Superuser</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small">
                    <InputLabel>Verified?</InputLabel>
                    <Select
                        value={verifiedFilter}
                        label="Verified?"
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                        style={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                    </Select>
                </FormControl>

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
                        <TableCell>Utorid</TableCell>
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
                        .map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{Capitalize(row.role)}</TableCell>
                            <TableCell>{row.utorid}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{formatDate(row.birthday)}</TableCell>
                            <TableCell>{row.points}</TableCell>
                            <TableCell>{row.verified ? "Yes" : "No"}</TableCell>
                            <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                            <TableCell>{formatDateTime(row.lastLogin)}</TableCell>
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
                            <TableCell colSpan={10} className={styles.userTableEmpty}>
                                <div className={styles.tableLoading}>
                                    <div className={styles.spinner} />
                                    <span>Loading users...</span>
                                </div>
                            </TableCell>
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
        
                <Box className={styles.tablePaginationBar}>
                    <Pagination
                        count={Math.max(1, Math.ceil(total / rowsPerPage))}
                        page={page + 1}
                        onChange={(_, val) => handleChangePage(null, val - 1)}
                        siblingCount={1}
                        boundaryCount={1}
                        disabled={loading}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="user-rows-label">Rows</InputLabel>
                        <Select
                            labelId="user-rows-label"
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
  
