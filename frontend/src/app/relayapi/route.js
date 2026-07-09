import { NextResponse } from "next/server";
import { decryptResponse } from "../lib/crypto";

// Backend URL (ensure protocol is included)
const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * Helper to build the base URL for a given module/service.
 */
function getServiceBase(request) {
    const module = request.headers.get("module") || request.headers.get("service") || "user";
    return `${BACKEND}/${module}`;
}

/**
 * Parse the raw response from the backend.
 * If the payload is encrypted, decrypt it, otherwise return the JSON body.
 */
async function parseResponse(res) {
    const text = await res.text();
    try {
        const payload = JSON.parse(text);
        return payload.encrypted ? decryptResponse(payload.encrypted) : payload;
    } catch {
        return { message: text };
    }
}

/**
 * Centralised fetch wrapper that logs useful debugging information.
 */
async function doFetch(url, options) {
    console.log("Relay forwarding:", options.method, url);
    try {
        const res = await fetch(url, options);
        console.log("Backend status:", res.status);
        const raw = await res.text();
        console.log("Backend raw response:", raw);
        // Re‑create a Response so parseResponse can read it again
        const clone = new Response(raw, { status: res.status, headers: res.headers });
        return { res: clone, payload: await parseResponse(clone) };
    } catch (err) {
        console.error("Relay fetch failed:", err);
        throw err;
    }
}

export async function GET(request) {
    try {
        const endpoint = request.headers.get("endpoint");
        const impersonationToken = request.headers.get("x-impersonation-token");
        const token = impersonationToken || request.headers.get("authorization");
        const base = getServiceBase(request);
        const profileId = request.headers.get("x-profile-id");
        const qs = profileId ? `?profileId=${profileId}` : "";

        const { res, payload } = await doFetch(`${base}/${endpoint}${qs}`, {
            method: "GET",
            headers: { ...(token ? { Authorization: token } : {}) },
        });
        return NextResponse.json(payload, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const endpoint = request.headers.get("endpoint");
        const contentType = request.headers.get("content-type") || "";
        const impersonationToken = request.headers.get("x-impersonation-token");
        const token = impersonationToken || request.headers.get("authorization");
        const base = getServiceBase(request);

        let body;
        const fetchHeaders = {};
        if (token) fetchHeaders["Authorization"] = token;
        if (contentType.includes("application/json")) {
            const json = await request.json();
            body = JSON.stringify(json);
            fetchHeaders["Content-Type"] = "application/json";
        } else {
            body = await request.formData();
        }

        const { res, payload } = await doFetch(`${base}/${endpoint}`, {
            method: "PUT",
            headers: fetchHeaders,
            body,
        });
        return NextResponse.json(payload, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const endpoint = request.headers.get("endpoint");
        const contentType = request.headers.get("content-type") || "";
        const impersonationToken = request.headers.get("x-impersonation-token");
        const token = impersonationToken || request.headers.get("authorization");
        const base = getServiceBase(request);

        let body;
        const fetchHeaders = {};
        if (token) fetchHeaders["Authorization"] = token;
        if (contentType.includes("application/json")) {
            const json = await request.json();
            body = JSON.stringify(json);
            fetchHeaders["Content-Type"] = "application/json";
        } else {
            body = await request.formData();
        }

        const { res, payload } = await doFetch(`${base}/${endpoint}`, {
            method: "POST",
            headers: fetchHeaders,
            body,
        });
        return NextResponse.json(payload, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
    }
}