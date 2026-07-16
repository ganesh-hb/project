"use client";

export function getUserInfo() {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem("userInfo");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function isSuperAdmin(userInfo) {
    if (!userInfo) return false;
    const groupName = userInfo?.primaryProfile?.groupName || userInfo?.groupName;
    if (!groupName) return false;
    const groups = Array.isArray(groupName) ? groupName : [groupName];
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
    return {
        "Content-Type": "application/json",
        ...extra,
    };
}
