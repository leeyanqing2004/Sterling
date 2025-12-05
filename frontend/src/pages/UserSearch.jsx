import Nav from "../components/Profile/Nav";
import styles from "./AllUsers.module.css";
import UserSearchTable from "../components/Tables/UserSearchTable";
import BackLinkButton from "../components/Buttons/BackLinkButton";

function UserSearch() {
    return (
        <div className={styles.allUsersPageContainer}>

            {/* everything under the top Nav container */}
            <div className={styles.allUsersLeftNavAndTableContainer}>
                {/* keep left column empty to align with other pages */}
                <div className={styles.allUsersleftNavContainer} />

                {/* main content area reusing table container styling */}
                <div className={styles.allUsersTableContainer}>
                    <BackLinkButton to="/dashboard" className={styles.manageEventBackButton}>
                        ← Back to Dashboard
                    </BackLinkButton>
                    <UserSearchTable />
                </div>
            </div>
        </div>
    );
}

export default UserSearch;
