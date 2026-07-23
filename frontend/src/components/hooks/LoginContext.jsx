"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import { decryptResponse } from "@/app/lib/crypto";
import { authHeaders } from "@/app/lib/auth";

export const loginContext = createContext();

export default function LoginContext({ children }) {
    const [isLogin, setLogin] = useState(null);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [impersonating, setImpersonating] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        async function restoreSession() {
            try {
                const storedUserInfo = sessionStorage.getItem("userInfo");

                if (storedUserInfo) {
                    try {
                        const parsed = JSON.parse(storedUserInfo);
                        setLogin(parsed);

                        const storedAssignment = sessionStorage.getItem("activeAssignment");
                        setActiveAssignment(
                            storedAssignment
                                ? JSON.parse(storedAssignment)
                                : parsed.assignments?.find((a) => a.is_parent === 0) ?? parsed.assignments?.[0] ?? null
                        );

                        const impersonatedUser = sessionStorage.getItem("impersonatedUser");
                        if (impersonatedUser) {
                            setImpersonating(JSON.parse(impersonatedUser));
                            const impersonatedPerms = sessionStorage.getItem("impersonatedPermissions");
                            setPermissions(impersonatedPerms ? JSON.parse(impersonatedPerms) : []);
                        } else {
                            const storedPerms = sessionStorage.getItem("permissions");
                            setPermissions(storedPerms ? JSON.parse(storedPerms) : parsed.permissions || []);
                        }
                    } catch (e) {
                        console.error("Failed to parse optimistic user info:", e);
                    }
                }

                const res = await fetch(`/relayapi`, {
                    method: "GET",
                    headers: {
                        endpoint: "user-me",
                        module: "user",
                    },
                });

                if (res.ok) {
                    const payload = await res.json();
                    const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;

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
                    sessionStorage.setItem("userInfo", JSON.stringify(normalized));
                    
                    const isCurrentlyImpersonating = !!sessionStorage.getItem("impersonatedUser");
                    if (!isCurrentlyImpersonating) {
                        setActiveAssignment(primary);
                        setPermissions(normalized.permissions);
                        sessionStorage.setItem("permissions", JSON.stringify(normalized.permissions));
                    }
                } else {
                    setLogin(false);
                    sessionStorage.removeItem("userInfo");
                    sessionStorage.removeItem("permissions");
                    sessionStorage.removeItem("activeAssignment");
                }
            } catch (err) {
                console.error("Session restore failed:", err);
                setLogin(false);
                sessionStorage.removeItem("userInfo");
                sessionStorage.removeItem("permissions");
                sessionStorage.removeItem("activeAssignment");
            }
            finally {
                setAuthReady(true);
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
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.success === 1) {
                sessionStorage.setItem("impersonatedUser", JSON.stringify(data.user));
                sessionStorage.setItem("impersonatedPermissions", JSON.stringify(data.user?.permissions || []));

                // Preserve the real session's active profile so we can restore it later
                if (activeAssignment) {
                    sessionStorage.setItem("originalActiveAssignment", JSON.stringify(activeAssignment));
                }

                setImpersonating(data.user);
                setPermissions(data.user?.permissions || []);

                const impersonatedAssignment =
                    data.user?.assignments?.find((a) => a.is_parent === 0) ??
                    data.user?.assignments?.[0] ??
                    data.user?.primaryProfile ??
                    null;
                setActiveAssignment(impersonatedAssignment);
                if (impersonatedAssignment) {
                    sessionStorage.setItem("activeAssignment", JSON.stringify(impersonatedAssignment));
                }

                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    function stopImpersonating() {
        const impUserStr = sessionStorage.getItem("impersonatedUser");
        let targetUserId = null;
        if (impUserStr) {
            try {
                targetUserId = JSON.parse(impUserStr).userId;
            } catch (e) {}
        }
        fetch("/relayapi", {
            method: "POST",
            headers: {
                ...authHeaders(),
                endpoint: "user-stop-impersonating",
                module: "user",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ targetUserId }),
        })
        .then(res => res.json())
        .then(data => console.log('stop-impersonate response:', data))
        .catch((err) => console.error('stop-impersonate fetch error:', err));

        sessionStorage.removeItem("impersonatedUser");
        sessionStorage.removeItem("activeAssignment");
        sessionStorage.removeItem("impersonatedPermissions");
        localStorage.removeItem("impersonationToken");
        setImpersonating(null);

        const original = sessionStorage.getItem("permissions");
        setPermissions(original ? JSON.parse(original) : []);

        const originalAssignment = sessionStorage.getItem("originalActiveAssignment");
        if (originalAssignment) {
            setActiveAssignment(JSON.parse(originalAssignment));
            sessionStorage.setItem("activeAssignment", originalAssignment);
            sessionStorage.removeItem("originalActiveAssignment");
        }
    }

    const displayUser = useMemo(() => {
        if (impersonating) {
            return {
                ...impersonating,
                assignments: impersonating.assignments || (impersonating.primaryProfile ? [impersonating.primaryProfile] : []),
            };
        }
        return isLogin;
    }, [impersonating, isLogin]);

    function switchProfile(assignment) {
        setActiveAssignment(assignment);
        sessionStorage.setItem("activeAssignment", JSON.stringify(assignment));
    }

    function login(data) {
        if (!data || !data.user) return;
        const user = data.user;

        sessionStorage.setItem("userInfo", JSON.stringify(user));
        sessionStorage.setItem("permissions", JSON.stringify(user.permissions || []));
        setLogin(user);

        const primary =
            user.activeAssignment ??
            user.assignments?.find((a) => a.is_parent === 0) ??
            user.assignments?.[0] ??
            null;

        setActiveAssignment(primary);
        if (primary) {
            sessionStorage.setItem("activeAssignment", JSON.stringify(primary));
        }
        setPermissions(user.permissions || []);
    }

    function logout() {
        fetch("/relayapi", {
            method: "POST",
            headers: { ...authHeaders(), endpoint: "user-logout", module: "user" },
            body: JSON.stringify({
                userId: isLogin?.userId,
                companyId: activeAssignment?.companyId,
                email: isLogin?.email,
            }),
        }).catch(() => { });

        setLogin(null);
        setActiveAssignment(null);
        setPermissions([]);
        setImpersonating(null);
        sessionStorage.removeItem("userInfo");
        sessionStorage.removeItem("activeAssignment");
        sessionStorage.removeItem("permissions");
        sessionStorage.removeItem("impersonatedUser");
        sessionStorage.removeItem("impersonatedPermissions");
        sessionStorage.removeItem("originalActiveAssignment");
    }

    function can(permission) {
        return permissions.includes(permission);
    }

    function canAny(...perms) {
        return perms.some((p) => permissions.includes(p));
    }

    return (
        <loginContext.Provider value={{
            isLogin, setLogin, displayUser,
            activeAssignment, switchProfile,
            permissions, can, canAny,
            impersonating, loginAs, stopImpersonating,
            login, logout, authReady,
        }}>
            {children}
        </loginContext.Provider>
    );
}