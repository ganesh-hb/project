import { NextResponse } from "next/server";
import { decryptResponse } from "../lib/crypto";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

function getServiceBase(request) {
    const module = request.headers.get("module") || "user";
    return `${BACKEND}/${module}`;
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

        const payload = await res.json();
        if (!res.ok) return NextResponse.json({ error: payload.message || "Request failed" }, { status: res.status });

        const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
        return NextResponse.json(data, { status: 200 });
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
            fetchHeaders["Content-Type"] = "application/json";
        } else {
            body = await request.formData();
        }

        const res = await fetch(`${base}/${endpoint}`, { method: "PUT", headers: fetchHeaders, body });
        const payload = await res.json();
        const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
    }
}

export async function POST(request) {
    console.log("################ in the relay api")
    try {
        const endpoint = request.headers.get("endpoint");
        const contentType = request.headers.get("content-type") || "";
        const token = request.headers.get("authorization");
        const module = request.headers.get("module");
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
        console.log(`${base}/${endpoint}##################### relay api post`)
        const res = await fetch(`${base}/${endpoint}`, { method: "POST", headers: fetchHeaders, body });
        const payload = await res.json();
        const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
    }
}

// export async function POST(request) {

//     try {
//         const userData = await request.json();

//         const res = await fetch('http://localhost:4000/user/user-create', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(userData)
//         });
//         const text = await res.text();
//         let data;

//         try {
//             data = JSON.parse(text);
//         } catch {
//             data = { message: text };
//         }

//         if (!res.ok) {
//             return NextResponse.json(data, { status: res.status });
//         }

//         return NextResponse.json(data, { status: 200 });
//     } catch (err) {
//         console.error('Error in userrelayapi:', err);
//         return NextResponse.json(
//             { error: err.message || 'Something went wrong' },
//             { status: 500 }
//         );
//     }
// }