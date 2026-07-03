"use client";

export function getUserInfo() {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("userInfo");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken") || null;
}

export function isSuperAdmin(userInfo) {
    if (!userInfo) return false;
    const groupName = userInfo?.primaryProfile?.groupName || userInfo?.groupName;
    if (!groupName) return false;
    const groups = Array.isArray(groupName) ? groupName : [groupName];
    console.log(groups.includes("superAdmin"), "##################### superadminCheck")
    return groups.includes("superAdmin");
}

export function isCompanyAdmin(userInfo) {
    if (!userInfo) return false;
    const groupName = userInfo?.primaryProfile?.groupName || userInfo?.groupName;
    if (!groupName) return false;
    const groups = Array.isArray(groupName) ? groupName : [groupName];
    return groups.includes("companyAdmin");
}

export function canUpdateUsers(userInfo) {
    return isSuperAdmin(userInfo) || isCompanyAdmin(userInfo);
}

export function canSeeAllCompaniesAndGroups(userInfo) {
    return isSuperAdmin(userInfo);
}

export function authHeaders(extra = {}) {
    const token = getImpersonationToken() || getAccessToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

export function getPermissions() {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem("permissions");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function can(permission) {
    return getPermissions().includes(permission);
}

export function canAny(...perms) {
    return perms.some((p) => getPermissions().includes(p));
}

export function isImpersonating() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("impersonationToken");
}

export function getImpersonationToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("impersonationToken");
}

export function impersonationHeaders(extra = {}) {
    const token = getImpersonationToken() || getAccessToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

