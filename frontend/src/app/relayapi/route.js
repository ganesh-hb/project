import { NextResponse } from "next/server";
import { decryptResponse } from "../lib/crypto";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

function getServiceBase(request) {
    const module = request.headers.get("module") || request.headers.get("service") || "user";
    return `${BACKEND}/${module}`;
}

async function parseResponse(res) {
    const text = await res.text();
    try {
        const payload = JSON.parse(text);
        return payload.encrypted ? decryptResponse(payload.encrypted) : payload;
    } catch {
        return { message: text };
    }
}

export async function GET(request) {
    try {
        const endpoint = request.headers.get("endpoint");
        const token = request.headers.get("authorization");
        const base = getServiceBase(request);
        const profileId = request.headers.get("x-profile-id");
        const qs = profileId ? `?profileId=${profileId}` : "";

        const res = await fetch(`${base}/${endpoint}${qs}`, {
            method: "GET",
            headers: { ...(token ? { Authorization: token } : {}) },
        });

        const data = await parseResponse(res);
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const endpoint = request.headers.get("endpoint");
        const contentType = request.headers.get("content-type") || "";
        const token = request.headers.get("authorization");
        const base = getServiceBase(request);

        let body;
        let fetchHeaders = {};
        if (token) fetchHeaders["Authorization"] = token;
        if (contentType.includes("application/json")) {
            const json = await request.json();
            body = JSON.stringify(json);
            console.log(body)
            fetchHeaders["Content-Type"] = "application/json";
        } else {
            body = await request.formData();
        }

        const res = await fetch(`${base}/${endpoint}`, { method: "PUT", headers: fetchHeaders, body });
        const data = await parseResponse(res);
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const endpoint = request.headers.get("endpoint");
        const contentType = request.headers.get("content-type") || "";
        const token = request.headers.get("authorization");
        const base = getServiceBase(request);

        let body;
        let fetchHeaders = {};
        if (token) fetchHeaders["Authorization"] = token;

        if (contentType.includes("application/json")) {
            const json = await request.json();
            body = JSON.stringify(json);
            fetchHeaders["Content-Type"] = "application/json";
        } else {
            body = await request.formData();
        }

        const res = await fetch(`${base}/${endpoint}`, { method: "POST", headers: fetchHeaders, body });
        const data = await parseResponse(res);
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
    }
}