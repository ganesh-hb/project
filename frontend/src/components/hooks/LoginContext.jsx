"use client";
import { createContext, useEffect, useState } from "react";

export const loginContext = createContext();

export default function LoginContext({ children }) {
    const [isLogin, setLogin] = useState(null);
    const [activeAssignment, setActiveAssignment] = useState(null);

    useEffect(() => {
        async function restoreSession() {
            const storedUserInfo = localStorage.getItem("userInfo");
            if (storedUserInfo) {
                try {
                    const parsed = JSON.parse(storedUserInfo);
                    setLogin(parsed);
                    // Restore active assignment: prefer stored, else primary, else first
                    const storedAssignment = localStorage.getItem("activeAssignment");
                    if (storedAssignment) {
                        setActiveAssignment(JSON.parse(storedAssignment));
                    } else {
                        const primary =
                            parsed.assignments?.find((a) => a.is_parent === 0) ??
                            parsed.assignments?.[0] ??
                            null;
                        setActiveAssignment(primary);
                    }
                    return;
                } catch {
                    localStorage.removeItem("userInfo");
                    localStorage.removeItem("activeAssignment");
                }
            }

            const loggedIn = document.cookie
                .split("; ")
                .find((row) => row.startsWith("loggedIn="))
                ?.split("=")[1];
            if (!loggedIn) return;

            const token = localStorage.getItem("accessToken");
            if (!token) return;

            try {
                const res = await fetch(`http://localhost:3000/relayapi`, {
                    method: "GET",
                    headers: { endpoint: `user-details/${loggedIn}`, Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setLogin(data);
                    localStorage.setItem("userInfo", JSON.stringify(data));
                    const primary =
                        data.assignments?.find((a) => a.is_parent === 0) ??
                        data.assignments?.[0] ??
                        null;
                    setActiveAssignment(primary);
                }
            } catch (err) {
                console.error("Session restore failed:", err);
            }
        }
        restoreSession();
    }, []);

    function switchProfile(assignment) {
        setActiveAssignment(assignment);
        localStorage.setItem("activeAssignment", JSON.stringify(assignment));
    }

    function logout() {
        setLogin(null);
        setActiveAssignment(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("activeAssignment");
        document.cookie = "session=; Max-Age=0";
        document.cookie = "loggedIn=; Max-Age=0";
    }

    return (
        <loginContext.Provider value={{ isLogin, setLogin, activeAssignment, switchProfile, logout }}>
            {children}
        </loginContext.Provider>
    );
}