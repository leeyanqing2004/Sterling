import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useState } from "react";
import styles from "./TransactionTable.module.css"
  
export default function TransactionTable({ 
    transTableTitle, includeManageButton, recentOnlyBool, transactions }) {
    // dummy data
    // const rows = Array.from({ length: 50 }, (_, i) => ({
    //     id: i + 1,
    //     utorid: `[Utorid Here]`,
    //     type: `[e.g. purchase]`,
    //     spent: (Math.random() * 100).toFixed(2),
    //     earned: (Math.random() * 100).toFixed(2),
    //     remark: "[remark here]",
    //     promotionIds: "[e.g. [42]]",
    //     createdBy: "[createdBy utorid here]"
    // }));

    // transactions = an array of transactions = [{"id": 123, "utorid": ...}, {"id": 124, "utorid": ...}]
  
    const rows = transactions;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const [createdByFilter, setCreatedByFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
    const [utoridFilter, setUtoridFilter] = useState("");

    const [sortBy, setSortBy] = useState("");
  
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const processedRows = rows
    // FILTER
    .filter((row) =>
        (idFilter === "" || row.id === Number(idFilter)) &&
        row.createdBy?.toLowerCase().includes(createdByFilter.toLowerCase()) &&
        row.type?.toLowerCase().includes(transactionTypeFilter.toLowerCase()) &&
        row.utorid?.toLowerCase().includes(utoridFilter.toLowerCase())
    )
    // SORT
    .sort((a, b) => {
        if (!sortBy) return 0;
        if (sortBy === "id") return a.id - b.id;
        if (sortBy === "amount") return a.amount - b.amount;
        return 0;
    });
  
    return (
        <div className={styles.transactionTableContainer}>
            <div className={styles.transactionTableTitle}>{transTableTitle}</div>
            {!recentOnlyBool && (
                <Box display="flex" gap={2} mb={2}>
                    {/* Filter Input */}
                    <TextField
                        label="Transaction ID"
                        variant="outlined"
                        size="small"
                        value={idFilter}
                        onChange={(e) => setIdFilter(e.target.value)}
                    />
                    
                    <TextField
                        label="CreatedBy"
                        variant="outlined"
                        size="small"
                        value={createdByFilter}
                        onChange={(e) => setCreatedByFilter(e.target.value)}
                    />

                    {includeManageButton && 
                        <TextField
                            label="Utorid"
                            variant="outlined"
                            size="small"
                            value={utoridFilter}
                            onChange={(e) => setUtoridFilter(e.target.value)}
                        />
                    }

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
                            <MenuItem value="amount">Amount</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={transactionTypeFilter}
                            label="Transaction Type"
                            onChange={(e) => setTransactionTypeFilter(e.target.value)}
                            style={{ minWidth: 150 }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="purchase">Purchase</MenuItem>
                            <MenuItem value="adjustment">Adjustment</MenuItem>
                            <MenuItem value="redemption">Redemption</MenuItem>
                            <MenuItem value="transfer">Transfer</MenuItem>
                            <MenuItem value="event">Event</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            )}
            <Paper>
                <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        {includeManageButton && <TableCell>Utorid</TableCell>}
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Remark</TableCell>
                        <TableCell>Promotions Applied</TableCell>
                        <TableCell>Created By</TableCell>
                        <TableCell>Additional Details</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    </TableHead>
        
                    <TableBody>
                    {processedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            {includeManageButton && <TableCell>{row.utorid}</TableCell>}
                            <TableCell>{row.type}</TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>{row.remark}</TableCell>
                            <TableCell>{row.promotionIds}</TableCell>
                            <TableCell>{row.createdBy}</TableCell>
                            {/* <TableCell>Additional Info Here</TableCell> */}
                            <TableCell>
                                {Object.entries(row)
                                    .filter(
                                        ([key]) =>
                                            !["id", "utorid", "earned", "remark", "promotionIds", "createdBy"].includes(key)
                                    )
                                    .map(([key, value]) => (
                                        <div key={key}>
                                            <strong>{key}:</strong> {value?.toString()}
                                        </div>
                                    ))}
                            </TableCell>
                            <TableCell> {includeManageButton ? <button>Manage Transaction</button> : null} </TableCell>
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
  