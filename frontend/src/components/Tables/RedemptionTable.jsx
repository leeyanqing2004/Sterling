import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination
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

    useEffect(() => {
        const fetchRedemptions = async () => {
            try {
                const response = await api.request({
                    method: "GET",
                    url: "/users/me/transactions",
                    data: {
                        type: "redemption",
                        page: 1,
                        limit: 1000,
                        processed: processedBool
                    }
                });
                setRows(response.data.results || []);
            } catch (err) {
                console.error(err);
                setRows([]);
            }
        };

        fetchRedemptions();
    }, [filter, sortBy]);
  
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
    // FILTER
    .filter((row) => {
        if (row.utorid) {
            return row.utorid.toLowerCase().includes(filter.toLowerCase());
        } else {
            return false;
        }
    })
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
        <div className={styles.redempTableContainer}>
            <div className={styles.redempTableTitle}>{redempTableTitle}</div>
            <Box display="flex" gap={2} mb={2}>
                {/* Filter Input */}
                <TextField
                    label=""
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
                        <MenuItem value="utorid">UTORid</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Paper>
                <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell> {processedBool ? "Points Redeemed" : "Points to Redeem"} </TableCell>
                        <TableCell>Remark</TableCell>
                        <TableCell> {processedBool ? "Processed By" : null} </TableCell>
                    </TableRow>
                    </TableHead>
        
                    <TableBody>
                    {processedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell> {processedBool ? row.redeemed : row.amount} </TableCell> {/* if not processed, the amount to be redeemed is the 'amount' of the redemption transaction */}
                            <TableCell>{row.remark}</TableCell>
                            <TableCell> {processedBool ? row.processedBy : null} </TableCell> 
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </TableContainer>
        
                <TablePagination
                component="div"
                count={rows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}
  