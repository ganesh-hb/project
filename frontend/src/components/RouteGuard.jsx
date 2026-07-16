"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginContext } from "./hooks/LoginContext";

export default function RouteGuard({ permission, isSuperAdminOnly = false, children }) {
    const { isLogin, can, authReady } = useContext(loginContext);
    const router = useRouter();

    const [authState, setAuthState] = useState("loading"); // "loading" | "ok" | "denied"

    useEffect(() => {
        if (!authReady) {
            setAuthState("loading");
            return;
        }
        checkAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authReady, isLogin]);

    function checkAccess() {
        // No session at all → redirect to login
        if (!isLogin) {
            router.replace("/login");
            setAuthState("denied");
            return;
        }

        // superAdmin-only pages
        if (isSuperAdminOnly) {
            const primaryGroup =
                isLogin?.primaryProfile?.groupName || isLogin?.groupName || "";
            const groups = Array.isArray(primaryGroup) ? primaryGroup : [primaryGroup];
            if (!groups.includes("superAdmin")) {
                router.replace("/forbidden");
                setAuthState("denied");
                return;
            }
        }

        // Permission-gated pages
        if (permission && !can(permission)) {
            router.replace("/forbidden");
            setAuthState("denied");
            return;
        }

        setAuthState("ok");
    }

    if (authState === "loading") {
        // Minimal skeleton — prevents any flash of protected content
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">
                <div className="text-gray-400 text-sm animate-pulse">Loading…</div>
            </div>
        );
    }

    if (authState === "denied") return null;

    return children;
}
