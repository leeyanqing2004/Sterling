import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Pagination
} from "@mui/material";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "./RafflesTable.module.css";
import { formatDateTime } from "../../utils/formatDateTime";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import RaffleWinnerPopup from "../Popups/RaffleWinnerPopup";
import ConfirmPopup from "../Popups/ConfirmPopup";

export default function RafflesTable({
    raffleTableTitle,
    raffles,
    serverPaging = false,
    page: controlledPage,
    rowsPerPage: controlledRowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    totalCount,
    loading = false,
    showMyRafflesOnly = false,
    onRaffleUpdate
}) {
    const { user } = useAuth();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";
    const [localRaffles, setLocalRaffles] = useState(raffles || []);
    
    // Update local raffles when prop changes
    useEffect(() => {
        setLocalRaffles(raffles || []);
    }, [raffles]);
    
    const rows = localRaffles;

    const [page, setPage] = useState(controlledPage ?? 0);
    const [rowsPerPage, setRowsPerPage] = useState(controlledRowsPerPage ?? 10);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [enteringRaffle, setEnteringRaffle] = useState({});
    const [drawingRaffle, setDrawingRaffle] = useState(null);
    const [toast, setToast] = useState(null);
    const [winnerPopup, setWinnerPopup] = useState({ open: false, raffle: null, winner: null });
    const [confirmPopup, setConfirmPopup] = useState({ open: false, raffleId: null });

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

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const processedRows = rows
        .filter((row) =>
            (idFilter === "" || row.id === Number(idFilter)) &&
            row.name.toLowerCase().includes(nameFilter.toLowerCase())
        );

    const countForPagination = serverPaging
        ? (typeof totalCount === "number" ? totalCount : rows.length)
        : processedRows.length;
    const maxPage = Math.max(0, Math.ceil(countForPagination / rowsPerPage) - 1);
    const rangeStart = countForPagination === 0 ? 0 : page * rowsPerPage + 1;
    const rangeEnd = countForPagination === 0 ? 0 : Math.min(countForPagination, page * rowsPerPage + rowsPerPage);
    
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

    const handleJoinRaffle = async (raffle) => {
        const raffleId = raffle.id;
        const now = new Date();
        const startTime = new Date(raffle.startTime);
        const endTime = new Date(raffle.endTime);

        // Check if raffle has ended
        if (now > endTime) {
            setToast({ message: "Cannot join raffles that have ended", type: "error" });
            return;
        }

        // Check if raffle has started
        if (now < startTime) {
            setToast({ message: "Raffle has not started yet", type: "error" });
            return;
        }

        // Check if already drawn
        if (raffle.drawn) {
            setToast({ message: "Raffle has already been drawn", type: "error" });
            return;
        }

        setEnteringRaffle((prev) => ({ ...prev, [raffleId]: true }));

        try {
            const response = await api.post(`/raffles/${raffleId}/enter`);
            setToast({ message: "Successfully joined raffle", type: "success" });
            
            // Update local state to reflect the join
            setLocalRaffles(prevRaffles => 
                prevRaffles.map(r => 
                    r.id === raffleId 
                        ? { 
                            ...r, 
                            userEntered: true,
                            entryCount: (r.entryCount || 0) + 1
                          }
                        : r
                )
            );
            
            // Optionally notify parent (but don't force a full reload)
            if (onRaffleUpdate) {
                onRaffleUpdate();
            }
        } catch (err) {
            const status = err.response?.status;
            const errorMsg = err.response?.data?.error || "Failed to join raffle";
            
            if (status === 400 && errorMsg.includes("already entered")) {
                setToast({ message: "Already joined this raffle", type: "error" });
            } else if (status === 400 && errorMsg.includes("Insufficient points")) {
                setToast({ message: "Insufficient points to join this raffle", type: "error" });
            } else {
                setToast({ message: errorMsg, type: "error" });
            }
        } finally {
            setEnteringRaffle((prev) => ({ ...prev, [raffleId]: false }));
        }
    };

    const handleDrawWinnerClick = (raffleId) => {
        setConfirmPopup({ open: true, raffleId });
    };

    const handleConfirmDraw = async () => {
        const raffleId = confirmPopup.raffleId;
        if (!raffleId) return;
        
        setConfirmPopup({ open: false, raffleId: null });
        setDrawingRaffle(raffleId);
        try {
            const response = await api.post(`/raffles/${raffleId}/draw`);
            const winnerData = response.data.raffle.winner;
            const raffleData = rows.find(r => r.id === raffleId);
            
            // Show winner popup
            setWinnerPopup({
                open: true,
                raffle: {
                    id: response.data.raffle.id,
                    name: response.data.raffle.name,
                    prizePoints: response.data.raffle.prizePoints || raffleData?.prizePoints || 0
                },
                winner: winnerData
            });
            
            // Notify parent to reload data
            if (onRaffleUpdate) {
                onRaffleUpdate();
            } else if (onPageChange) {
                // Fallback: trigger page change to reload
                onPageChange(page);
            }
        } catch (err) {
            const errorMsg = err?.response?.data?.error || "Failed to draw winner";
            setToast({ message: errorMsg, type: "error" });
        } finally {
            setDrawingRaffle(null);
        }
    };

    const getRaffleStatus = (raffle) => {
        const now = new Date();
        const startTime = new Date(raffle.startTime);
        const endTime = new Date(raffle.endTime);
        const drawTime = new Date(raffle.drawTime);

        if (raffle.drawn) {
            return { label: "Drawn", color: "default" };
        } else if (now < startTime) {
            return { label: "Upcoming", color: "info" };
        } else if (now >= startTime && now <= endTime) {
            return { label: "Open", color: "success" };
        } else if (now > endTime && now < drawTime) {
            return { label: "Closed", color: "warning" };
        } else {
            return { label: "Ready to Draw", color: "error" };
        }
    };

    const paginatedRows = serverPaging
        ? processedRows
        : processedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    const backDisabled = loading || page <= 0;
    const nextDisabled = loading || page >= maxPage;
    const pageCount = Math.max(1, Math.ceil(countForPagination / rowsPerPage));

    return (
        <>
            <div className={styles.raffleTableContainer}>
                <div className={styles.raffleTableTitle}>{raffleTableTitle}</div>
                
                {!showMyRafflesOnly && (
                    <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                        <TextField
                            label="Filter by raffle name"
                            variant="outlined"
                            size="small"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />
                        <TextField
                            label="Raffle ID"
                            variant="outlined"
                            size="small"
                            value={idFilter}
                            onChange={(e) => setIdFilter(e.target.value)}
                        />
                    </Box>
                )}

                <Paper>
                    <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Point Cost</TableCell>
                                <TableCell>Prize Points</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>End Time</TableCell>
                                <TableCell>Draw Time</TableCell>
                                <TableCell>Entries</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Winner</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={12}>
                                        <div className={styles.tableLoading}>
                                            <div className={styles.spinner} />
                                            <span>Loading raffles...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12}>
                                        <div className={styles.tableLoading}>
                                            <span>No raffles to display.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map((raffle) => {
                                    const status = getRaffleStatus(raffle);
                                    const isJoined = raffle.userEntered;
                                    const isLoading = Boolean(enteringRaffle[raffle.id]);
                                    const now = new Date();
                                    const startTime = new Date(raffle.startTime);
                                    const endTime = new Date(raffle.endTime);
                                    const drawTime = new Date(raffle.drawTime);
                                    const isEnded = now > endTime;
                                    const notStarted = now < startTime;
                                    const isReadyToDraw = status.label === "Ready to Draw";
                                    const canJoin = !isManagerOrSuperuser && !isJoined && !isEnded && !notStarted && !raffle.drawn;
                                    // Draw time is reached when current time is >= draw time
                                    const drawTimeReached = now >= drawTime;
                                    const canDraw = isManagerOrSuperuser && 
                                                   !raffle.drawn && 
                                                   drawTimeReached &&
                                                   raffle.entryCount > 0;
                                    const showDrawButton = isManagerOrSuperuser && !raffle.drawn;
                                    

                                    let disabledReason = "";
                                    if (isEnded) {
                                        disabledReason = "Raffle has ended";
                                    } else if (notStarted) {
                                        disabledReason = "Raffle has not started";
                                    } else if (raffle.drawn) {
                                        disabledReason = "Raffle has been drawn";
                                    }

                                    return (
                                        <TableRow key={raffle.id}>
                                            <TableCell>{raffle.id}</TableCell>
                                            <TableCell>{raffle.name}</TableCell>
                                            <TableCell>{raffle.description}</TableCell>
                                            <TableCell>{raffle.pointCost}</TableCell>
                                            <TableCell>{raffle.prizePoints}</TableCell>
                                            <TableCell>{formatDateTime(raffle.startTime)}</TableCell>
                                            <TableCell>{formatDateTime(raffle.endTime)}</TableCell>
                                            <TableCell>{formatDateTime(raffle.drawTime)}</TableCell>
                                            <TableCell>{raffle.entryCount}</TableCell>
                                            <TableCell>
                                                <span className={styles.drawnStatus}>
                                                    {status.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {raffle.drawn && raffle.winner 
                                                    ? raffle.winner.utorid 
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {showDrawButton ? (
                                                    <button
                                                        className={styles.drawWinnerBtn}
                                                        onClick={() => {
                                                            if (drawingRaffle === raffle.id) return;
                                                            if (!drawTimeReached) {
                                                                setToast({ message: `Draw time has not been reached yet. Draw time: ${formatDateTime(raffle.drawTime)}`, type: "error" });
                                                                return;
                                                            }
                                                            if (raffle.entryCount === 0) {
                                                                setToast({ message: "No entries in this raffle", type: "error" });
                                                                return;
                                                            }
                                                            handleDrawWinnerClick(raffle.id);
                                                        }}
                                                        disabled={drawingRaffle === raffle.id}
                                                        title={
                                                            drawingRaffle === raffle.id 
                                                                ? "Drawing winner..." 
                                                                : !drawTimeReached 
                                                                    ? `Draw time has not been reached yet. Current: ${now.toISOString()}, Draw: ${raffle.drawTime}` 
                                                                    : raffle.entryCount === 0 
                                                                        ? `No entries in this raffle (${raffle.entryCount} entries)` 
                                                                        : "Click to draw winner"
                                                        }
                                                    >
                                                        {drawingRaffle === raffle.id ? "Drawing..." : "Draw Winner"}
                                                    </button>
                                                ) : isEnded ? (
                                                    <button className={styles.raffleEndedBtn} disabled>
                                                        Raffle Ended
                                                    </button>
                                                ) : (
                                                    <>
                                                        {isJoined && !raffle.drawn ? (
                                                            <button
                                                                className={styles.joinRaffleBtnSecondary}
                                                                disabled
                                                            >
                                                                Joined
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className={styles.joinRaffleBtn}
                                                                onClick={() => handleJoinRaffle(raffle)}
                                                                disabled={isLoading || !canJoin}
                                                                title={disabledReason || (isJoined ? "Already joined" : "Click to join raffle")}
                                                            >
                                                                {isLoading
                                                                    ? "Loading..."
                                                                    : notStarted
                                                                    ? "Not Started"
                                                                    : raffle.drawn
                                                                    ? "Drawn"
                                                                    : "Join Raffle"}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
                        disabled={loading}
                        className={styles.pagination}
                        classes={{ ul: styles.paginationList }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }} className={styles.rowsSelect}>
                        <InputLabel id="raffle-rows-label">Rows</InputLabel>
                        <Select
                            labelId="raffle-rows-label"
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
            {toast && (
                <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
                    {toast.message}
                </div>
            )}
            <RaffleWinnerPopup
                open={winnerPopup.open}
                raffle={winnerPopup.raffle}
                winner={winnerPopup.winner}
                onClose={() => setWinnerPopup({ open: false, raffle: null, winner: null })}
            />
            <ConfirmPopup
                open={confirmPopup.open}
                title="Draw Winner"
                message="Are you sure you want to draw the winner for this raffle? This action cannot be undone."
                confirmLabel="Draw Winner"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDraw}
                onCancel={() => setConfirmPopup({ open: false, raffleId: null })}
            />
        </>
    );
}
