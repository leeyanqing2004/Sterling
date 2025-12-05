import styles from "./Raffles.module.css";
import RafflesTable from "../components/Tables/RafflesTable";
import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import NewRafflePopup from "../components/Popups/NewRafflePopup";

function AllRaffles() {
    const { user } = useAuth();
    const isManagerOrSuperuser = user?.role === "manager" || user?.role === "superuser";
    const [raffles, setRaffles] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showNewRaffle, setShowNewRaffle] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadRaffles = async () => {
        setLoading(true);
        try {
            const response = await api.get("/raffles", {
                params: {
                    page: page + 1,
                    limit: rowsPerPage
                }
            });
            setRaffles(response.data?.results || []);
            setCount(response.data?.count || 0);
        } catch (err) {
            console.error("Failed to load raffles:", err);
            setRaffles([]);
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRaffles();
    }, [page, rowsPerPage, refreshKey]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className={styles.rafflesContainer}>
            {isManagerOrSuperuser && (
                <div className={styles.allRafflesTableTopContainer}>
                    <button
                        className={styles.allRafflesTableTopContainerButton}
                        onClick={() => setShowNewRaffle(true)}
                    >
                        + Create New Raffle
                    </button>
                </div>
            )}
            <RafflesTable
                raffleTableTitle="All Raffles"
                raffles={raffles}
                serverPaging={true}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={(val) => {
                    setRowsPerPage(val);
                    setPage(0);
                }}
                totalCount={count}
                loading={loading}
                showMyRafflesOnly={false}
                onRaffleUpdate={loadRaffles}
            />
            {showNewRaffle && (
                <NewRafflePopup
                    show={showNewRaffle}
                    onClose={() => setShowNewRaffle(false)}
                    onCreated={() => {
                        setPage(0);
                        setRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    );
}

export default AllRaffles;

