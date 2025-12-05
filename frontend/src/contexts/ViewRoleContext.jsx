import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ViewRoleContext = createContext(null);

export const ViewRoleProvider = ({ children }) => {
    const [viewRole, setViewRole] = useState(null);

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
    } else {
        return user ? user.role : null;
    }
};

export const useViewRole = () => {
    return useContext(ViewRoleContext);
};