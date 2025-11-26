import "./Nav.css";

function Nav({ id }) {
    return (<nav id={id} className="nav">
                <ul className="nav-list">
                    <li className="nav-list-item">
                        <a className="nav-list-item-link" href="/">Events</a>
                    </li>
                    <li className="nav-list-item">
                        <a className="nav-list-item-link" href="/">Profile</a>
                    </li>
                    <li className="nav-list-item">
                        <a className="nav-list-item-link" href="/">Settings</a>
                    </li>
                </ul>
    </nav>);
}

export default Nav;