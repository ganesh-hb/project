"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CapabilitiesRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/roles"); }, [router]);
    return null;
}