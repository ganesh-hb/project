"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy route — redirects to the new /roles/[id] path
export default function CapabilityRedirect({ params }) {
    const router = useRouter();
    useEffect(() => {
        const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
        router.replace(id ? `/roles/${id}` : "/roles");
    }, [router, params]);
    return null;
}