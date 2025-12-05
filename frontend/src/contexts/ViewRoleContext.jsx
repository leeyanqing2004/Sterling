import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ViewRoleContext = createContext(null);

export const ViewRoleProvider = ({ children }) => {
    const { user } = useAuth();
    const [viewRole, setViewRole] = useState(user?.role || "");

    useEffect(() => {
        if (user?.role) {
            setViewRole(user?.role);
        } else {
            setViewRole("");
        }
    }, [user?.role]);

    return (
        <ViewRoleContext.Provider value={{ viewRole, setViewRole }}>
            {children}
        </ViewRoleContext.Provider>
    );
};

export const getViewRole = () => {
    const { user } = useAuth();
    const { viewRole } = useViewRole();

    if (viewRole) {
        return viewRole;
    }
    return user?.role;
};

export const useViewRole = () => {
    return useContext(ViewRoleContext);
};