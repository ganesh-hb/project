"use client"
import { Children, createContext, useContext, useState } from "react"
export const userListContext = createContext()
export default function UserListContext({ children }) {
    const [users, setUsers] = useState([]);
    return (
        <>
            <userListContext.Provider value={{ users, setUsers }}>
                {children}
            </userListContext.Provider>
        </>
    )
}