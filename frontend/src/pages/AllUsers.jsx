import styles from "./AllUsers.module.css";
import UserTable from "../components/Tables/UserTable";
import { getAllUsers } from "../api/getUsersApi";
import { useEffect, useState } from "react";

let allUsersCache = null;
let allUsersCountCache = 0;

function AllUsers() {

    const [allUsers, setAllUsers] = useState(() => allUsersCache || []);
    const [count, setCount] = useState(() => allUsersCountCache || 0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (allUsersCache) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await getAllUsers({ limit: 500 });
                allUsersCache = data?.results || [];
                allUsersCountCache = data?.count || allUsersCache.length;
                setAllUsers(allUsersCache);
                setCount(allUsersCountCache);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className={styles.allUsersTableContainer}>
            <UserTable userTableTitle={"All Users"} users ={allUsers}/>
            {loading && <div className={styles.loadingText}>Loading...</div>}
        </div>
    );
}

export default AllUsers;
