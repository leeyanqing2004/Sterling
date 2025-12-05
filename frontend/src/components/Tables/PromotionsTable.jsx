import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Pagination, Checkbox
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box, FormControlLabel } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "./PromotionsTable.module.css"
import { formatDateTime } from "../../utils/formatDateTime";
import { Capitalize } from "../../utils/capitalize";
import { formatField } from "../../utils/formatField";
import { useAuth } from "../../contexts/AuthContext";
import ManagePromotionPopup from "../Popups/ManagePromotionPopup";
import PromotionDetailsPopup from "../Popups/PromotionDetailsPopup";
  
export default function PromotionsTable({
    promoTableTitle,
    availableOnlyBool,
    promotions,
    serverPaging = false,
    page: controlledPage,
    rowsPerPage: controlledRowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    totalCount,
    loading = false,
    onPromotionUpdate
}) {
    const { user } = useAuth();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";
    const rows = promotions || [];
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [activePromotion, setActivePromotion] = useState(null);

    //TODO: include logic that filters depending on availableOnlyBool
  
    const [page, setPage] = useState(controlledPage ?? 0);
    const [rowsPerPage, setRowsPerPage] = useState(controlledRowsPerPage ?? 10);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [spentFilter, setSpentFilter] = useState("");
    const [promotionTypeFilter, setPromotionTypeFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    const handleShowDetails = (promotion) => setSelectedPromotion(promotion);
    const handleCloseDetails = () => setSelectedPromotion(null);
  
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
    // Filter for available promotions only, if applicable
    .filter((row) => {
        const now = new Date();

        if (!availableOnlyBool || !showAvailableOnly) return true;
    
        const start = new Date(row.startTime);
        const end = new Date(row.endTime);
    
        return start <= now && now <= end;
    })
    // FILTER
    .filter((row) =>
        (idFilter === "" || row.id === Number(idFilter)) &&
        (spentFilter === "" || row.minSpending <= Number(spentFilter)) &&
        row.name.toLowerCase().includes(nameFilter.toLowerCase()) && 
        row.type.toLowerCase().includes(promotionTypeFilter.toLowerCase())
    )
    // SORT
    .sort((a, b) => {
        if (!sortBy) return 0;
        if (sortBy === "id") return a.id - b.id;
        if (sortBy === "minSpending") return a.minSpending - b.minSpending;
        if (sortBy === "rate") return a.rate - b.rate;
        if (sortBy === "points") return a.points - b.points;
        if (sortBy === "type") return a.type.localeCompare(b.type);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
    });

    const countForPagination = serverPaging
        ? (typeof totalCount === "number" ? totalCount : rows.length)
        : processedRows.length;
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
        <div className={styles.promoTableContainer}>
            <div className={styles.promoTableTitle}>{promoTableTitle}</div>
            <Box display="flex" gap={2} mb={2}>
                {/* Filter Input */}
                <TextField
                    label="Filter by promotion name"
                    variant="outlined"
                    size="small"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                />

                <TextField
                    label="Promotion ID"
                    variant="outlined"
                    size="small"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                />

                <TextField
                    label="Available by Price"
                    variant="outlined"
                    size="small"
                    value={spentFilter}
                    onChange={(e) => setSpentFilter(e.target.value)}
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
                        <MenuItem value="minSpending">Minimum Spending</MenuItem>
                        <MenuItem value="rate">Rate</MenuItem>
                        <MenuItem value="points">Points</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={promotionTypeFilter}
                        label="Promotion Type"
                        onChange={(e) => setPromotionTypeFilter(e.target.value)}
                        style={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="one-time">One-Time</MenuItem>
                        <MenuItem value="automatic">Automatic</MenuItem>
                    </Select>
                </FormControl>

                {!availableOnlyBool && <FormControlLabel // availableOnlyBool is False if it's a Manager. In this case, allow them to see this filter option.
                    control={
                        <Checkbox
                            checked={showAvailableOnly}
                            onChange={(e) => setShowAvailableOnly(e.target.checked)}
                        />
                    }
                    label="Show Available Promotions Only"
                />}
            </Box>
            <Paper>
                <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Minimum Spending</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Points</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    </TableHead>
        
                    <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={9}>
                            <div className={styles.tableLoading}>
                                <div className={styles.spinner} />
                                <span>Loading promotions...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : processedRows.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9}>
                            <div className={styles.tableLoading}>
                                <span>No promotions to display.</span>
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
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{Capitalize(row.type)}</TableCell>
                            <TableCell>{formatDateTime(row.startTime)}</TableCell>
                            <TableCell>{formatDateTime(row.endTime)}</TableCell>
                            <TableCell>{formatField(row.minSpending)}</TableCell>
                            <TableCell>{formatField(row.rate)}</TableCell>
                            <TableCell>{formatField(row.points)}</TableCell>
                            <TableCell>
                                {isManagerOrSuperuser ? (
                                    <button
                                        className={styles.moreDetailsBtn}
                                        onClick={() => setActivePromotion(row)}
                                    >
                                        Manage Promotion
                                    </button>
                                ) : (
                                    <button className={styles.moreDetailsBtn}>
                                        More Details
                                    </button>
                                )}
                            </TableCell>
                        </TableRow>
                        ))
                )}
                    </TableBody>
                </Table>
                </TableContainer>
        
                <Box className={styles.tablePaginationBar}>
                    <Pagination
                        count={pageCount}
                        page={page + 1}
                        onChange={(_, val) => handleChangePage(null, val - 1)}
                        siblingCount={1}
                        boundaryCount={1}
                        disabled={loading}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="promo-rows-label">Rows</InputLabel>
                        <Select
                            labelId="promo-rows-label"
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
            {activePromotion && isManagerOrSuperuser && (
                <ManagePromotionPopup
                    show={!!activePromotion}
                    promotion={activePromotion}
                    onClose={() => setActivePromotion(null)}
                    onPromotionUpdate={(updated) => {
                        setActivePromotion(updated);
                        if (onPromotionUpdate) onPromotionUpdate(updated);
                    }}
                />
            )}
        </div>
    );
}
  
