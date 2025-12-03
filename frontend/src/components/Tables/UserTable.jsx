import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> origin/main
import api from "../../api/api";
import styles from "./UserTable.module.css"
  
export default function UserTable({ userTableTitle }) {
    const [rows, setRows] = useState([]);
<<<<<<< HEAD
=======
    const [totalCount, setTotalCount] = useState(0);
>>>>>>> origin/main
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
<<<<<<< HEAD
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
=======

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const params = {
                    page: page + 1,
                    limit: rowsPerPage,
                }

                if (filter) {
                    params.name = filter;
                }

                const response = await api.get("/users", {
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
        fetchUsers();
    }, [page, rowsPerPage, filter]);
>>>>>>> origin/main
  
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
<<<<<<< HEAD
    // FILTER
    .filter((row) =>
        (row.name || "").toLowerCase().includes(filter.toLowerCase()) ||
        (row.utorid || "").toLowerCase().includes(filter.toLowerCase())
    )
    // SORT
=======
>>>>>>> origin/main
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
                        <MenuItem value="utorid">Utorid</MenuItem>
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
<<<<<<< HEAD
                    {(loading ? [] : processedRows)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
=======
                    {processedRows.map((row) => (
>>>>>>> origin/main
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.role}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{formatDate(row.birthday)}</TableCell>
                            <TableCell>{row.points}</TableCell>
                            <TableCell>{row.verified ? "Yes" : "No"}</TableCell>
                            <TableCell>{formatDate(row.createdAt)}</TableCell>
                            <TableCell>{formatDate(row.lastLogin)}</TableCell>
                            <TableCell>
                                <button className={styles.manageBtn} onClick = {() => ManageUserPopup(row)}>Manage User</button>
                            </TableCell>
                        </TableRow>
<<<<<<< HEAD
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
=======
                    ))}
>>>>>>> origin/main
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
  
