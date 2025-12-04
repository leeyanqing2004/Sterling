import styles from "./AllUsers.module.css";
import UserTable from "../components/Tables/UserTable";
import { getAllUsers } from "../api/getUsersApi";
import { useEffect, useState } from "react";

function AllUsers() {

    const [allUsers, setAllUsers] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            const data = await getAllUsers({ limit: 10000 });
            setAllUsers(data.results);
            setCount(data.count);
        }
        loadData();
    }, []);

    return (
        <div className={styles.allUsersTableContainer}>
            <UserTable userTableTitle={"All Users"} users ={allUsers}/>
        </div>
    );
}

export default AllUsers;
