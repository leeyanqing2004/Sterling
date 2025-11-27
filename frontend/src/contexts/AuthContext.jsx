import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api/api";

const AuthContext = createContext(null);

// Here, I'm using and modifying the code from T11.

// Get the BACKEND_URL.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Retrieve token from localStorage and make an api call to GET /user/me.

        // when the user is logged in (i.e., localStorage contains a valid token), 
        //      fetch the user data from /user/me,
        //      and update the user context state with the returned user object.

        // when the user is not logged in (i.e., localStorage does not contain a token), 
        //      set the user context state to null.

        // first, we get the token from localStorage
        const fetchUser = async() => {
            const token = localStorage.getItem("token");
            const expiresAt = localStorage.getItem("expiresAt"); // we also store the expiresAt of the token
            const expiryDate = new Date(expiresAt);
            const currentDate = new Date();

            if (!token) {
                // set user context state to null
                setUser(null);
            } 
            else if (currentDate > expiryDate) {
                // if the token has expired, log out the user. 
                // TODO: Should we have a 'your session has expired' page?
                localStorage.removeItem("token");
                setUser(null);
                navigate("/");
            }
            else {

                // const response = await fetch(`${BACKEND_URL}/users/me`, {
                //     method: "GET",
                //     headers: {
                //     "Authorization": `Bearer ${token}`
                //     }
                // })
                // const data = await response.json();
                // const user = data.user;

                const response = await api.get("/users/me");
                setUser(response.data);

            }
        };
        fetchUser();

    }, [])

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // TODO: complete me
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (utorid, password) => {

        try {
            // YQ: using the username and password, we fetch the token
            const response = await fetch (`${BACKEND_URL}/auth/tokens`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    utorid: `${utorid}`,
                    password: `${password}`,
                })
            })

            const data = await response.json();

            if (!response.ok) {
                return data.message || "Login failed"
            }

            const token = data.token;
            const expiresAt = data.expiresAt;
            
            localStorage.setItem("token", token);
            localStorage.setItem("expiresAt", expiresAt);
            
            // const userResponse = await fetch(`${BACKEND_URL}/user/me`, {
            //     method: "GET",
            //     headers: { "Authorization": `Bearer ${token}` }
            // });

            // const userData = await userResponse.json();
            
            // setUser(userData.user);

            const userRes = await api.get("/users/me");
            setUser(userRes.data);

            navigate("/home"); // TODO: hypothetical "/home" page right now
            return null;
        } catch (err) {
            return "Network error"
        }
    };

    /** sendResetPassEmail */
    const sendResetPassEmail = async (utorid) => {
        try {
            const response = await fetch (`${BACKEND_URL}/auth/resets`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    utorid: `${utorid}`,
                })
            })

            const data = await response.json();

            if (!response.ok) {
                return data.message || "No account exists with this Utorid."
            }

            navigate("/login", { state: { pageType: "emailSent" } });
            return null;

        } catch (err) {
            return "Network error"
        }
    }

    /** setPassword */
    const setPassword = async (utorid, password, resetToken) => {
        try {
            const response = await fetch (`${BACKEND_URL}/auth/resets/${resetToken}`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    utorid: `${utorid}`,
                    password: `${password}`,
                })
            })

            const data = await response.json();

            if (!response.ok) {
                return data.message || "Reset password failed."
            }

            navigate("/login", { state: { pageType: "passwordChanged" } });
            return null;

        } catch (err) {
            return "Network error"
        }
    }

    /** createAccount
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const createAccount = async (utorid, name, email) => {
        try {
            const newUserRes = await fetch(`${BACKEND_URL}/users/new`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    utorid: utorid,
                    name: name,
                    email: email,
                })
            })

            const newUserData = await newUserRes.json()

            if (!newUserRes.ok) {
                return newUserData.message || "Utorid or email already in use."
            }

            setUser(newUserData);

            const response = await fetch (`${BACKEND_URL}/auth/resets`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    utorid: `${utorid}`,
                })
            })

            const data = await response.json();
            const resetToken = data.resetToken;

            if (!response.ok) {
                return data.message || "No account exists with this Utorid."
            }

            navigate(`/set-password?token=${resetToken}`);
            return null;

        } catch (err) {
            return "Network error";
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, createAccount, sendResetPassEmail, setPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
