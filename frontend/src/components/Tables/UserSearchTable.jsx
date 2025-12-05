import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
} from "@mui/material";
import { TextField, Box } from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api/api";
import styles from "./UserTable.module.css";
import PanelActionButton from "../Buttons/PanelActionButton";
import NewPurchasePopup from "../Popups/NewPurchasePopup";
import ProcessRedemptionPopup from "../Popups/ProcessRedemptionPopup";
import SuccessInfoPopup from "../Popups/SuccessInfoPopup";
import { createPurchase } from "../../api/getTransactionsApi";
import { getPromotions } from "../../api/getPromotionsApi";

export default function UserSearchTable() {
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [nameFilter, setNameFilter] = useState("");
    const [purchaseForUtorid, setPurchaseForUtorid] = useState(null);
    const [promotionsOptions, setPromotionsOptions] = useState([]);
    const [showRedemption, setShowRedemption] = useState(false);
    const [successModal, setSuccessModal] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const params = {
                    page: page + 1,
                    limit: rowsPerPage,
                };

                if (nameFilter.trim()) {
                    params.name = nameFilter.trim();
                }

                const response = await api.get("/users", { params });
                setRows(response.data.results || []);
                setTotalCount(response.data.count || 0);
            } catch (err) {
                console.error(err);
                setRows([]);
                setTotalCount(0);
            }
        };
        fetchUsers();
    }, [page, rowsPerPage, nameFilter]);

    // Load available promotions once for the popup options
    useEffect(() => {
        const loadPromos = async () => {
            try {
                const data = await getPromotions({ limit: 1000 });
                setPromotionsOptions(data.results || []);
            } catch (err) {
                console.error("Failed to load promotions", err);
                setPromotionsOptions([]);
            }
        };
        loadPromos();
    }, []);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    return (
        <div className={styles.userTableContainer}>
            <div className={styles.userTableTitle}>User Search</div>
            <Box display="flex" flexDirection="column" gap={1} mb={2}>
                <TextField
                    label="Name"
                    variant="outlined"
                    size="small"
                    value={nameFilter}
                    onChange={(e) => {
                        setNameFilter(e.target.value);
                        setPage(0);
                    }}
                    placeholder="Search by Name or UTORid"
                    fullWidth
                />
            </Box>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>UTORid</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell>Verified</TableCell>
                                <TableCell>Promotions Available</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.utorid}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.points}</TableCell>
                                    <TableCell>
                                        {row.verified ? "Yes" : "n/a"}
                                    </TableCell>
                                    <TableCell>n/a</TableCell>
                                    <TableCell>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => setShowRedemption(true)}
                                            title={`Redeem points for ${row.name} (${row.utorid})`}
                                        >
                                            {`Redeem for ${row.utorid}`}
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => setPurchaseForUtorid(row.utorid)}
                                            title={`Create purchase for ${row.name} (${row.utorid})`}
                                        >
                                            {`Purchase for ${row.utorid}`}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
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

            {purchaseForUtorid && (
                <NewPurchasePopup
                    initialUtorid={purchaseForUtorid}
                    promotionsOptions={promotionsOptions}
                    onSubmit={async ({ utorid, spent, promotionIds, remark }) => {
                        return await createPurchase({ utorid, spent, promotionIds, remark });
                    }}
                    onClose={() => setPurchaseForUtorid(null)}
                />
            )}

            {showRedemption && (
                <ProcessRedemptionPopup
                    onClose={() => setShowRedemption(false)}
                    onSuccess={(payload) => setSuccessModal(payload)}
                />
            )}

            {successModal && (
                <SuccessInfoPopup
                    title={successModal.title}
                    lines={successModal.lines}
                    onClose={() => setSuccessModal(null)}
                />
            )}
        </div>
    );
}


