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
    const groups = Array.isArray(userInfo.groupName)
        ? userInfo.groupName
        : [userInfo.groupName];
    return groups.includes("superAdmin");
}

export function isCompanyAdmin(userInfo) {
    if (!userInfo) return false;
    const groups = Array.isArray(userInfo.groupName)
        ? userInfo.groupName
        : [userInfo.groupName];
    return groups.includes("companyAdmin");
}

export function canUpdateUsers(userInfo) {
    return isSuperAdmin(userInfo) || isCompanyAdmin(userInfo);
}

export function canSeeAllCompaniesAndGroups(userInfo) {
    return isSuperAdmin(userInfo);
}

export function authHeaders(extra = {}) {
    const token = getAccessToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

