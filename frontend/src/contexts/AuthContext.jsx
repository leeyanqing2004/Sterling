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
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async() => {
            setAuthLoading(true);
            const token = localStorage.getItem("token");
            const expiresAt = localStorage.getItem("expiresAt");
            const expiryDate = expiresAt ? new Date(expiresAt) : null;
            const currentDate = new Date();

            try {
                if (!token) {
                    setUser(null);
                } else if (expiryDate && currentDate > expiryDate) {
                    localStorage.removeItem("token");
                    setUser(null);
                    navigate("/");
                } else {
                    const response = await api.get("/users/me");
                    setUser(response.data);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };
        fetchUser();

    }, [navigate])

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
                return data.error || "Login failed."
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
            const userData = userRes.data;
            setUser(userData);

            navigate(`/profile/${userData.utorid}/home`); // TODO: hypothetical "/home" page right now
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
                return data.error || "No account exists with this Utorid."
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
                return data.error || "Reset password failed."
            }

            // navigate("/login", { state: { pageType: "passwordChanged" } });
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
                return newUserData.error || "Utorid or email already in use."
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
                return data.error || "No account exists with this Utorid."
            }

            navigate(`/set-password?token=${resetToken}`);
            return null;

        } catch (err) {
            return "Network error";
        }
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, login, logout, createAccount, sendResetPassEmail, setPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
