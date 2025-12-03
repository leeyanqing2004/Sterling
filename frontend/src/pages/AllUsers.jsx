import Nav from "../components/Profile/Nav";
import LeftNav from "../components/Profile/LeftNav";
import styles from "./AllUsers.module.css";
import UserTable from "../components/Tables/UserTable";

function AllUsers() {
    return <div className={styles.allUsersPageContainer}>

        {/* top Nav container */}
        <div className={styles.allUsersNav}>
            <Nav />
        </div>

        {/* everything under the top Nav container */}
        <div className={styles.allUsersLeftNavAndTableContainer}>

            {/* left Nav container */}
            <div className={styles.allUsersleftNavContainer}>
                <LeftNav />
            </div>

            {/* everything to the right of the left Nav container */}
            <div className={styles.allUsersTableContainer}>
                <UserTable userTableTitle={"All Users"} />
            </div>
        </div>
    </div>;
}

export default AllUsers;