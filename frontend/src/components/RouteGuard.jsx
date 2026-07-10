"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginContext } from "./hooks/LoginContext";


export default function RouteGuard({ permission, isSuperAdminOnly = false, children }) {
    const { isLogin, can, permissions } = useContext(loginContext);
    const router = useRouter();

    const [authState, setAuthState] = useState("loading"); // "loading" | "ok" | "denied"

    useEffect(() => {
        // isLogin is null while LoginContext is restoring the session — wait.
        if (isLogin === null && permissions.length === 0) {
            // Give localStorage-based restore a chance to run (it's synchronous in
            // useEffect, so by the next tick permissions will be set if a session exists).
            const timer = setTimeout(() => {
                checkAccess();
            }, 50);
            return () => clearTimeout(timer);
        }
        checkAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLogin, permissions]);

    function checkAccess() {
        // No session at all → redirect to login
        if (!isLogin && !localStorage.getItem("accessToken")) {
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
