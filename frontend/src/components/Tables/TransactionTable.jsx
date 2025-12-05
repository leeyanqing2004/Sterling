import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Pagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "./TransactionTable.module.css";
import ManageTransactionPopup from "../Popups/ManageTransactionPopup";
import { Capitalize } from "../../utils/capitalize";
import { formatField } from "../../utils/formatField";

  
export default function TransactionTable({ 
    transTableTitle,
    includeManageButton,
    recentOnlyBool,
    transactions,
    serverPaging = false,
    page: controlledPage,
    rowsPerPage: controlledRowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    totalCount,
    loading = false,
    onTransactionUpdate: onTransactionUpdateProp
}) {
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
  
    const [rows, setRows] = useState(transactions || []);
    
    useEffect(() => {
        setRows(transactions || []);
    }, [transactions]);

    const [page, setPage] = useState(controlledPage ?? 0);
    const [rowsPerPage, setRowsPerPage] = useState(controlledRowsPerPage ?? 10);


    const [createdByFilter, setCreatedByFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
    const [utoridFilter, setUtoridFilter] = useState("");

    const [sortBy, setSortBy] = useState("");
    const [activeTransaction, setActiveTransaction] = useState(null);
    
    const handleTransactionUpdate = (updatedTransaction) => {
        // Update the active transaction so the popup shows the new data
        setActiveTransaction(updatedTransaction);
        // Update the transaction in the local rows array immediately
        setRows(prevRows => 
            prevRows.map(row => 
                row.id === updatedTransaction.id ? updatedTransaction : row
            )
        );
        // Notify parent component to refresh the transaction list
        if (onTransactionUpdateProp) {
            onTransactionUpdateProp(updatedTransaction);
        }
    };
  
    useEffect(() => {
        if (serverPaging && typeof controlledPage === "number") {
            setPage(controlledPage);
        }
    }, [serverPaging, controlledPage]);

    useEffect(() => {
        if (serverPaging && typeof controlledRowsPerPage === "number") {
            setRowsPerPage(controlledRowsPerPage);
        }
    }, [serverPaging, controlledRowsPerPage]);

    const processedRows = rows
    .filter((row) =>
        (idFilter === "" || row.id === Number(idFilter)) &&
        (row.createdBy || "").toLowerCase().includes(createdByFilter.toLowerCase()) &&
        (row.type || "").toLowerCase().includes(transactionTypeFilter.toLowerCase()) &&
        (row.utorid || "").toLowerCase().includes(utoridFilter.toLowerCase())
    )
    .sort((a, b) => {
        if (!sortBy) return 0;
        if (sortBy === "id") return a.id - b.id;
        if (sortBy === "amount") return Number(a.amount) - Number(b.amount);
        return 0;
    });

    const countForPagination = serverPaging
        ? (typeof totalCount === "number" ? totalCount : rows.length)
        : processedRows.length;
    const rangeStart = countForPagination === 0 ? 0 : page * rowsPerPage + 1;
    const rangeEnd = countForPagination === 0 ? 0 : Math.min(countForPagination, page * rowsPerPage + rowsPerPage);
    const maxPage = Math.max(0, Math.ceil(countForPagination / rowsPerPage) - 1);
    const handleChangePage = (_, newPage) => {
        if (newPage < 0 || newPage > maxPage) return;
        if (serverPaging && onPageChange) {
            onPageChange(newPage);
        } else {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (e) => {
        const next = parseInt(e.target.value, 10);
        if (serverPaging && onRowsPerPageChange) {
            onRowsPerPageChange(next);
        } else {
            setRowsPerPage(next);
            setPage(0);
        }
    };
    const backDisabled = loading || page <= 0;
    const nextDisabled = loading || page >= maxPage;
    const pageCount = Math.max(1, Math.ceil(countForPagination / rowsPerPage));
  
    return (
        <>
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
                            label="Created By"
                            variant="outlined"
                            size="small"
                            value={createdByFilter}
                            onChange={(e) => setCreatedByFilter(e.target.value)}
                        />

                        {includeManageButton && 
                            <TextField
                                label="UTORid"
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
                            {includeManageButton && <TableCell>UTORid</TableCell>}
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={includeManageButton ? 9 : 8}>
                                    <div className={styles.tableLoading}>
                                        <div className={styles.spinner} />
                                        <span>Loading transactions...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : processedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={includeManageButton ? 9 : 8}>
                                    <div className={styles.tableLoading}>
                                        <span>No transactions to display.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedRows
                                .slice(
                                    serverPaging ? 0 : page * rowsPerPage,
                                    serverPaging ? undefined : page * rowsPerPage + rowsPerPage
                                )
                                .map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        {includeManageButton && <TableCell>{row.utorid}</TableCell>}
                                        <TableCell>{Capitalize(row.type)}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                        <TableCell>{formatField(row.remark)}</TableCell>
                                        <TableCell>{formatField(row.promotionIds)}</TableCell>
                                        <TableCell>{row.createdBy}</TableCell>
                                        {/* <TableCell>Additional Info Here</TableCell> */}
                                        <TableCell>
                                            {Object.entries(row)
                                                .filter(
                                                    ([key]) =>
                                                        !["id", "utorid", "earned", "remark", "promotionIds", "createdBy", "amount", "type"].includes(key)
                                                )
                                                .map(([key, value]) => (
                                                    <div key={key}>
                                                        <strong>{Capitalize(key)}:</strong> {value?.toString()}
                                                    </div>
                                                ))}
                                        </TableCell>
                                        <TableCell>
                                            {includeManageButton ? (
                                                <button
                                                    className={styles.manageBtn}
                                                    onClick={() => setActiveTransaction(row)}
                                                >
                                                    Manage Transaction
                                                </button>
                                            ) : null}
                                        </TableCell>
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
                        count={pageCount}
                        page={page + 1}
                        onChange={(_, val) => handleChangePage(null, val - 1)}
                        siblingCount={1}
                        boundaryCount={1}
                        hidePrevButton={false}
                        hideNextButton={false}
                        disabled={loading}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="trans-rows-label">Rows</InputLabel>
                        <Select
                            labelId="trans-rows-label"
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
            {activeTransaction && (
                <ManageTransactionPopup
                    show={!!activeTransaction}
                    transaction={activeTransaction}
                    onClose={() => setActiveTransaction(null)}
                    onTransactionUpdate={handleTransactionUpdate}
                />
            )}
        </>
    );
}
  
