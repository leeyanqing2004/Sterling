import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Routes that should not have sub-paths (exact matches only)
const EXACT_ONLY_ROUTES = [
    '/dashboard',
    '/login',
    '/reset-password',
    '/set-password',
    '/transfer-points',
    '/redeem-points',
    '/past-transactions',
    '/all-users',
    '/all-promotions',
    '/available-promotions',
    '/all-events',
    '/published-events',
    '/my-events',
    '/my-redemptions',
    '/all-transactions',
    '/user-search',
    '/all-raffles',
    '/my-raffles'
];

// Routes that can have specific sub-paths (with patterns)
const PREFIX_ROUTES = {
    '/profile': /^\/profile(\/[^\/]+\/account)?$/, // /profile or /profile/:utorid/account
    '/manage-event': /^\/manage-event\/[^\/]+$/, // /manage-event/:eventId
    '/organizer-manage-event': /^\/organizer-manage-event\/[^\/]+$/ // /organizer-manage-event/:id
};

function NotFound() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, authLoading } = useAuth();

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        const currentPath = location.pathname;
        
        // Check if it's an invalid sub-path of an exact-only route
        const matchingExactRoute = EXACT_ONLY_ROUTES.find(route => {
            return currentPath.startsWith(route + '/') && currentPath !== route;
        });

        if (matchingExactRoute) {
            // Invalid sub-path - redirect to the parent route
            navigate(matchingExactRoute, { replace: true });
            return;
        }

        // Check if it's an invalid sub-path of a prefix route
        for (const [route, pattern] of Object.entries(PREFIX_ROUTES)) {
            if (currentPath.startsWith(route + '/') && !pattern.test(currentPath)) {
                // Invalid sub-path of a prefix route - redirect to dashboard
                if (user) {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
                return;
            }
        }

        // Try to go back in history if possible
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // No history, redirect based on auth status
            if (user) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }
    }, [navigate, location.pathname, user, authLoading]);

    // Show nothing while redirecting
    return null;
}

export default NotFound;

