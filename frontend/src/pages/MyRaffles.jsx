import styles from "./MyRaffles.module.css";
import RafflesTable from "../components/Tables/RafflesTable";
import React, { useState, useEffect } from "react";
import api from "../api/api";

function MyRaffles() {
    const [raffles, setRaffles] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadRaffles = async () => {
        setLoading(true);
        try {
            const response = await api.get("/raffles", {
                params: {
                    page: page + 1,
                    limit: rowsPerPage
                }
            });
            // Filter to only show raffles the user has entered
            const allRaffles = response.data?.results || [];
            const myRaffles = allRaffles.filter(raffle => raffle.userEntered);
            setRaffles(myRaffles);
            setCount(myRaffles.length);
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
    }, [page, rowsPerPage]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className={styles.myRafflesContainer}>
            <RafflesTable
                raffleTableTitle="My Raffles"
                raffles={raffles}
                serverPaging={false}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={(val) => {
                    setRowsPerPage(val);
                    setPage(0);
                }}
                totalCount={count}
                loading={loading}
                showMyRafflesOnly={true}
                onRaffleUpdate={loadRaffles}
            />
        </div>
    );
}

export default MyRaffles;

