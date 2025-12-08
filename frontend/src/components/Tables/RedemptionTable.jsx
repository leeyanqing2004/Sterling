import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Pagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api/api";
import styles from "./RedemptionTable.module.css"

export default function RedemptionTable({ redempTableTitle, processedBool }) {
    // this is make a fake table with 50 rows, just to see
    // const rows = Array.from({ length: 50 }, (_, i) => ({
    //     id: i + 1,
    //     utorid: `[Utorid Here]`,
    //     type: `[redemption]`,
    //     processedBy: "[processedBy utorid here]",
    //     amount: (Math.random() * 100).toFixed(2),
    //     redeemed: (Math.random() * 100).toFixed(2),
    //     remark: "[remark here]",
    //     createdBy: "[createdBy utorid here]"
    // }));

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRedemptions = async () => {
            setLoading(true);
            try {
                const response = await api.get("/users/me/transactions", {
                    params: {
                        type: "redemption",
                        page: 1,
                        limit: 1000
                    }
                });
                const list = response.data.results || [];
        const filtered = list.filter(r => Boolean(r.processed) === Boolean(processedBool));
        setRows(filtered);
            } catch (err) {
                console.error(err);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRedemptions();
    }, [processedBool]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
        // FILTER
        .filter((row) => {
            const term = filter.toLowerCase();
            const idMatch = String(row.id ?? "").toLowerCase().includes(term);
            const remarkMatch = (row.remark || "").toLowerCase().includes(term);
            return idMatch || remarkMatch;
        })
        // SORT
        .sort((a, b) => {
            if (!sortBy) return 0;
            if (sortBy === "id") return (a.id ?? 0) - (b.id ?? 0);
            if (sortBy === "points") {
                const aPts = processedBool ? (a.redeemed ?? 0) : (a.amount ?? 0);
                const bPts = processedBool ? (b.redeemed ?? 0) : (b.amount ?? 0);
                return aPts - bPts;
            }
            if (sortBy === "remark") return (a.remark || "").localeCompare(b.remark || "");
            return 0;
        });
    const countForPagination = processedRows.length;
    const rangeStart = countForPagination === 0 ? 0 : page * rowsPerPage + 1;
    const rangeEnd = countForPagination === 0 ? 0 : Math.min(countForPagination, page * rowsPerPage + rowsPerPage);

    return (
        <div className={styles.redempTableContainer}>
            <div className={styles.redempTableTitle}>{redempTableTitle}</div>
            <Box display="flex" gap={2} mb={2}>
                {/* Filter Input */}
                <TextField
                    label="Filter"
                    variant="outlined"
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search ID or remark"
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
                        <MenuItem value="points">{processedBool ? "Points Redeemed" : "Points to Redeem"}</MenuItem>
                        <MenuItem value="remark">Remark</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>{processedBool ? "Points Redeemed" : "Points to Redeem"}</TableCell>
                                <TableCell>Remark</TableCell>
                                <TableCell>{processedBool ? "Processed By" : null}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <div className={styles.tableLoading}>
                                            <div className={styles.spinner} />
                                            <span>Loading redemptions...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : processedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <div className={styles.tableEmpty}>
                                            <span>No redemptions to display.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                processedRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.id ?? "---"}</TableCell>
                                            <TableCell>{processedBool ? row.redeemed : row.amount}</TableCell>
                                            <TableCell>{row.remark ?? "---"}</TableCell>
                                            <TableCell>{processedBool ? (row.processedBy ?? "---") : null}</TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className={styles.tablePaginationBar}>
                    <div className={styles.rangeInfo}>
                        {countForPagination === 0 ? "0 of 0" : `${rangeStart}-${rangeEnd} of ${countForPagination}`}
                    </div>
                    <Pagination
                        count={Math.max(1, Math.ceil(processedRows.length / rowsPerPage))}
                        page={page + 1}
                        onChange={(_, val) => handleChangePage(null, val - 1)}
                        siblingCount={1}
                        boundaryCount={1}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="redemp-rows-label">Rows</InputLabel>
                        <Select
                            labelId="redemp-rows-label"
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
    );
}

