"use client";
import { createContext, useEffect, useState } from "react";

export const loginContext = createContext();

export default function LoginContext({ children }) {
    const [isLogin, setLogin] = useState(null);

    useEffect(() => {
        async function restoreSession() {
            // Try to restore user from localStorage first (faster, avoids extra API call)
            const storedUserInfo = localStorage.getItem("userInfo");
            if (storedUserInfo) {
                try {
                    const parsed = JSON.parse(storedUserInfo);
                    setLogin(parsed);
                    return;
                } catch {
                    localStorage.removeItem("userInfo");
                }
            }

            // Fallback: use cookie-based loggedIn userId
            const loggedIn = document.cookie
                .split("; ")
                .find((row) => row.startsWith("loggedIn="))
                ?.split("=")[1];

            if (!loggedIn) return;

            const token = localStorage.getItem("accessToken");
            if (!token) return;

            try {
                const allData = await fetch(`http://localhost:3000/relayapi`, {
                    method: "GET",
                    headers: {
                        endpoint: `user-details/${loggedIn}`,
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (allData.ok) {
                    const res = await allData.json();
                    setLogin(res);
                    localStorage.setItem("userInfo", JSON.stringify(res));
                }
            } catch (err) {
                console.error("Session restore failed:", err);
            }
        }

        restoreSession();
    }, []);

    /** Helper: clears all auth state on logout */
    function logout() {
        setLogin(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        document.cookie = "session=; Max-Age=0";
        document.cookie = "loggedIn=; Max-Age=0";
    }

    return (
        <loginContext.Provider value={{ isLogin, setLogin, logout }}>
            {children}
        </loginContext.Provider>
    );
}