import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination, Checkbox
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box, FormControlLabel } from "@mui/material";
import { useState } from "react";
import styles from "./PromotionsTable.module.css"
import PromotionDetailsPopup from "../Popups/PromotionDetailsPopup";

  
export default function PromotionsTable({ promoTableTitle, availableOnlyBool, promotions }) {

    const rows = promotions;
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);

    //TODO: include logic that filters depending on availableOnlyBool
  
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [spentFilter, setSpentFilter] = useState("");
    const [promotionTypeFilter, setPromotionTypeFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    const handleShowDetails = (promotion) => setSelectedPromotion(promotion);
    const handleCloseDetails = () => setSelectedPromotion(null);
  
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

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
  
    return (
        <div className={styles.promoTableContainer}>
            <div className={styles.promoTableTitle}>{promoTableTitle}</div>
            <Box display="flex" gap={2} mb={2}>
                {/* Filter Input */}
                <TextField
                    label="UTORid"
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
                    {processedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.type}</TableCell>
                            <TableCell>{row.startTime}</TableCell>
                            <TableCell>{row.endTime}</TableCell>
                            <TableCell>{row.minSpending}</TableCell>
                            <TableCell>{row.rate}</TableCell>
                            <TableCell>{row.points}</TableCell>
                            <TableCell>
                                <button
                                    className={styles.moreDetailsBtn}
                                    onClick={() => handleShowDetails(row)}
                                >
                                    More Details
                                </button>
                            </TableCell>
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
            {selectedPromotion && (
                <PromotionDetailsPopup
                    promotion={selectedPromotion}
                    onClose={handleCloseDetails}
                />
            )} 
        </div>
    );
}
  