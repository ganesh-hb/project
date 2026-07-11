"use client"
import { createContext, useState } from "react"
export const userListContext = createContext()
export default function UserListContext({ children }) {
    const [users, setUsers] = useState([]);
    const [savedPage, setSavedPage] = useState(1);
    const [savedTotalPages, setSavedTotalPages] = useState(1);

    return (
        <userListContext.Provider value={{ users, setUsers, savedPage, setSavedPage, savedTotalPages, setSavedTotalPages }}>
            {children}
        </userListContext.Provider>
    );
}