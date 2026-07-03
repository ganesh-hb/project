"use client";
import { createContext, useEffect, useState } from "react";
import { authHeaders } from "@/app/lib/auth";

export const loginContext = createContext();

export default function LoginContext({ children }) {
    const [isLogin, setLogin] = useState(null);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [impersonating, setImpersonating] = useState(null);

    useEffect(() => {
        async function restoreSession() {
            try {
                const storedUserInfo = localStorage.getItem("userInfo");

                if (storedUserInfo) {
                    const parsed = JSON.parse(storedUserInfo);
                    setLogin(parsed);

                    const storedAssignment = localStorage.getItem("activeAssignment");
                    setActiveAssignment(
                        storedAssignment
                            ? JSON.parse(storedAssignment)
                            : parsed.assignments?.find((a) => a.is_parent === 0) ?? parsed.assignments?.[0] ?? null
                    );

                    const impersonatedUser = localStorage.getItem("impersonatedUser");
                    if (impersonatedUser) {
                        setImpersonating(JSON.parse(impersonatedUser));
                        const impersonatedPerms = localStorage.getItem("impersonatedPermissions");
                        setPermissions(impersonatedPerms ? JSON.parse(impersonatedPerms) : []);
                    } else {
                        const storedPerms = localStorage.getItem("permissions");
                        setPermissions(storedPerms ? JSON.parse(storedPerms) : parsed.permissions || []);
                    }

                    return;
                }
                const loggedIn = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("loggedIn="))
                    ?.split("=")[1];

                if (!loggedIn) return;


                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const res = await fetch(`/relayapi`, {
                    method: "GET",
                    headers: {
                        endpoint: `user-details/${loggedIn}`,
                        module: "user",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();

                    const primary =
                        data.activeAssignment ??
                        data.assignments?.find((a) => a.is_parent === 0) ??
                        data.assignments?.[0] ??
                        null;

                    const normalized = {
                        userId: data.userId,
                        name: data.name,
                        email: data.email,
                        userFile: data.userFile,
                        status: data.status,
                        primaryProfile: primary ? {
                            companyName: primary.companyName,
                            groupName: primary.groupName,
                            is_parent: primary.is_parent,
                        } : null,
                        assignments: data.assignments || [],
                        permissions: data.permissions || [],
                    };

                    setLogin(normalized);
                    localStorage.setItem("userInfo", JSON.stringify(normalized));
                    setActiveAssignment(primary);
                    setPermissions(normalized.permissions);
                    localStorage.setItem("permissions", JSON.stringify(normalized.permissions));
                }
            } catch (err) {
                console.error("Session restore failed:", err);
            }
        }
        restoreSession();
    }, []);

    async function loginAs(targetUserId) {
        try {
            const res = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    endpoint: "user-login-as",
                    module: "user",
                },
                body: JSON.stringify({ targetUserId }),
            });
            const data = await res.json();
            if (data?.success === 1) {
                localStorage.setItem("impersonationToken", data.impersonationToken);
                localStorage.setItem("impersonatedUser", JSON.stringify(data.user));
                localStorage.setItem("impersonatedPermissions", JSON.stringify(data.user?.permissions || []));
                setImpersonating(data.user);
                setPermissions(data.user?.permissions || []);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    function stopImpersonating() {
        localStorage.removeItem("impersonationToken");
        localStorage.removeItem("impersonatedUser");
        localStorage.removeItem("impersonatedPermissions");
        setImpersonating(null);
        // Restore original superAdmin permissions
        const original = localStorage.getItem("permissions");
        setPermissions(original ? JSON.parse(original) : []);
    }

    function switchProfile(assignment) {
        setActiveAssignment(assignment);
        localStorage.setItem("activeAssignment", JSON.stringify(assignment));
    }

    function logout() {
        setLogin(null);
        setActiveAssignment(null);
        setPermissions([]);
        setImpersonating(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("activeAssignment");
        localStorage.removeItem("permissions");
        localStorage.removeItem("impersonationToken");
        localStorage.removeItem("impersonatedUser");
        localStorage.removeItem("impersonatedPermissions");
        document.cookie = "session=; Max-Age=0";
        document.cookie = "loggedIn=; Max-Age=0";
    }

    function can(permission) {
        return permissions.includes(permission);
    }

    function canAny(...perms) {
        return perms.some((p) => permissions.includes(p));
    }

    return (
        <loginContext.Provider value={{
            isLogin, setLogin,
            activeAssignment, switchProfile,
            permissions, can, canAny,
            impersonating, loginAs, stopImpersonating,
            logout,
        }}>
            {children}
        </loginContext.Provider>
    );
}