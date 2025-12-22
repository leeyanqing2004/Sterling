import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'sterling-theme';

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === "undefined") return false;
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        let theme = false;
        if (stored !== null) {
            theme = stored === 'dark';
        } else {
            // Check system preference if no stored preference
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        // Apply theme immediately to prevent flash
        const root = document.documentElement;
        root.setAttribute('data-theme', theme ? 'dark' : 'light');
        
        // Apply initial Material-UI styles
        const styleId = 'mui-theme-override';
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = `
            .MuiPaper-root {
                background-color: var(--table-bg) !important;
            }
            .MuiTable-root,
            .MuiTableContainer-root,
            .MuiTableBody-root,
            .MuiTableHead-root {
                background-color: var(--table-bg) !important;
            }
            .MuiTableCell-root {
                background-color: transparent !important;
                color: var(--text-primary) !important;
            }
            .MuiTableRow-root:hover .MuiTableCell-root {
                background-color: var(--table-row-hover) !important;
            }
            .MuiTableCell-head {
                color: var(--accent-color) !important;
            }
            .MuiInputBase-root,
            .MuiOutlinedInput-root {
                background-color: var(--bg-tertiary) !important;
                color: var(--text-primary) !important;
            }
            .MuiInputBase-input {
                color: var(--text-primary) !important;
            }
            .MuiInputBase-input::placeholder {
                color: var(--text-secondary) !important;
                opacity: 0.7;
            }
            .MuiOutlinedInput-notchedOutline {
                border-color: var(--border-color) !important;
            }
            .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
                border-color: var(--border-color) !important;
            }
            .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
                border-color: var(--accent-color) !important;
            }
            .MuiFormLabel-root {
                color: var(--text-secondary) !important;
            }
            .MuiFormLabel-root.Mui-focused {
                color: var(--accent-color) !important;
            }
            .MuiSelect-select {
                color: var(--text-primary) !important;
            }
            .MuiMenuItem-root {
                color: var(--text-primary) !important;
                background-color: var(--bg-primary) !important;
            }
            .MuiMenuItem-root:hover {
                background-color: var(--bg-tertiary) !important;
            }
            .MuiMenuItem-root.Mui-selected {
                background-color: var(--bg-tertiary) !important;
                color: var(--text-primary) !important;
            }
            .MuiMenu-paper,
            .MuiPopover-paper {
                background-color: var(--bg-primary) !important;
                color: var(--text-primary) !important;
            }
            .MuiList-root {
                background-color: var(--bg-primary) !important;
                color: var(--text-primary) !important;
            }
            .MuiPagination-root {
                color: var(--text-primary) !important;
            }
            .MuiPaginationItem-root {
                color: var(--text-primary) !important;
                background-color: transparent !important;
            }
            .MuiPaginationItem-root:hover {
                background-color: var(--bg-tertiary) !important;
            }
            .MuiPaginationItem-root.Mui-selected {
                background-color: var(--accent-color) !important;
                color: white !important;
            }
            .MuiPaginationItem-root.Mui-selected:hover {
                background-color: var(--accent-hover) !important;
            }
            .MuiPaginationItem-icon {
                color: var(--text-primary) !important;
            }
            .MuiPaginationItem-ellipsis {
                color: var(--text-secondary) !important;
            }
            .MuiPaginationItem-root *,
            .MuiPaginationItem-root span {
                color: var(--text-primary) !important;
            }
            .MuiPaginationItem-root.Mui-selected *,
            .MuiPaginationItem-root.Mui-selected span {
                color: white !important;
            }
        `;
        
        return theme;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        
        // Update localStorage
        localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
        
        // Apply theme to document root
        const root = document.documentElement;
        root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        
        // Force Material-UI Paper components to use correct background based on theme
        const styleId = 'mui-theme-override';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        if (isDarkMode) {
            styleElement.textContent = `
                .MuiPaper-root {
                    background-color: var(--table-bg) !important;
                }
                .MuiTable-root,
                .MuiTableContainer-root,
                .MuiTableBody-root,
                .MuiTableHead-root {
                    background-color: var(--table-bg) !important;
                }
                .MuiTableCell-root {
                    background-color: transparent !important;
                    color: var(--text-primary) !important;
                }
                .MuiTableRow-root:hover .MuiTableCell-root {
                    background-color: var(--table-row-hover) !important;
                }
                .MuiTableCell-head {
                    color: var(--accent-color) !important;
                }
                .MuiInputBase-root,
                .MuiOutlinedInput-root {
                    background-color: var(--bg-tertiary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiInputBase-input {
                    color: var(--text-primary) !important;
                }
                .MuiInputBase-input::placeholder {
                    color: var(--text-secondary) !important;
                    opacity: 0.7;
                }
                .MuiOutlinedInput-notchedOutline {
                    border-color: var(--border-color) !important;
                }
                .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
                    border-color: var(--border-color) !important;
                }
                .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
                    border-color: var(--accent-color) !important;
                }
                .MuiFormLabel-root {
                    color: var(--text-secondary) !important;
                }
                .MuiFormLabel-root.Mui-focused {
                    color: var(--accent-color) !important;
                }
                .MuiSelect-select {
                    color: var(--text-primary) !important;
                }
                .MuiMenuItem-root {
                    color: var(--text-primary) !important;
                    background-color: var(--bg-primary) !important;
                }
                .MuiMenuItem-root:hover {
                    background-color: var(--bg-tertiary) !important;
                }
                .MuiMenuItem-root.Mui-selected {
                    background-color: var(--bg-tertiary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiMenu-paper,
                .MuiPopover-paper {
                    background-color: var(--bg-primary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiList-root {
                    background-color: var(--bg-primary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiPagination-root {
                    color: var(--text-primary) !important;
                }
                .MuiPaginationItem-root {
                    color: var(--text-primary) !important;
                    background-color: transparent !important;
                }
                .MuiPaginationItem-root:hover {
                    background-color: var(--bg-tertiary) !important;
                }
                .MuiPaginationItem-root.Mui-selected {
                    background-color: var(--accent-color) !important;
                    color: white !important;
                }
                .MuiPaginationItem-root.Mui-selected:hover {
                    background-color: var(--accent-hover) !important;
                }
                .MuiPaginationItem-icon {
                    color: var(--text-primary) !important;
                }
                .MuiPaginationItem-ellipsis {
                    color: var(--text-secondary) !important;
                }
                .MuiPaginationItem-root *,
                .MuiPaginationItem-root span {
                    color: var(--text-primary) !important;
                }
                .MuiPaginationItem-root.Mui-selected *,
                .MuiPaginationItem-root.Mui-selected span {
                    color: white !important;
                }
            `;
        } else {
            styleElement.textContent = `
                .MuiPaper-root {
                    background-color: var(--table-bg) !important;
                }
                .MuiTable-root,
                .MuiTableContainer-root,
                .MuiTableBody-root,
                .MuiTableHead-root {
                    background-color: var(--table-bg) !important;
                }
                .MuiTableCell-root {
                    background-color: transparent !important;
                    color: var(--text-primary) !important;
                }
                .MuiTableRow-root:hover .MuiTableCell-root {
                    background-color: var(--table-row-hover) !important;
                }
                .MuiTableCell-head {
                    color: var(--accent-color) !important;
                }
                .MuiInputBase-root,
                .MuiOutlinedInput-root {
                    background-color: var(--bg-tertiary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiInputBase-input {
                    color: var(--text-primary) !important;
                }
                .MuiInputBase-input::placeholder {
                    color: var(--text-secondary) !important;
                    opacity: 0.7;
                }
                .MuiOutlinedInput-notchedOutline {
                    border-color: var(--border-color) !important;
                }
                .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
                    border-color: var(--border-color) !important;
                }
                .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
                    border-color: var(--accent-color) !important;
                }
                .MuiFormLabel-root {
                    color: var(--text-secondary) !important;
                }
                .MuiFormLabel-root.Mui-focused {
                    color: var(--accent-color) !important;
                }
                .MuiSelect-select {
                    color: var(--text-primary) !important;
                }
                .MuiMenuItem-root {
                    color: var(--text-primary) !important;
                    background-color: var(--bg-primary) !important;
                }
                .MuiMenuItem-root:hover {
                    background-color: var(--bg-tertiary) !important;
                }
                .MuiMenuItem-root.Mui-selected {
                    background-color: var(--bg-tertiary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiMenu-paper,
                .MuiPopover-paper {
                    background-color: var(--bg-primary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiList-root {
                    background-color: var(--bg-primary) !important;
                    color: var(--text-primary) !important;
                }
                .MuiPagination-root {
                    color: var(--text-primary) !important;
                }
                .MuiPaginationItem-root {
                    color: var(--text-primary) !important;
                    background-color: transparent !important;
                }
                .MuiPaginationItem-root:hover {
                    background-color: var(--bg-tertiary) !important;
                }
                .MuiPaginationItem-root.Mui-selected {
                    background-color: var(--accent-color) !important;
                    color: white !important;
                }
                .MuiPaginationItem-root.Mui-selected:hover {
                    background-color: var(--accent-hover) !important;
                }
                .MuiPaginationItem-icon {
                    color: var(--text-primary) !important;
                }
                .MuiPaginationItem-ellipsis {
                    color: var(--text-secondary) !important;
                }
                .MuiPaginationItem-root *,
                .MuiPaginationItem-root span {
                    color: var(--text-primary) !important;
                }
                .MuiPaginationItem-root.Mui-selected *,
                .MuiPaginationItem-root.Mui-selected span {
                    color: white !important;
                }
            `;
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

