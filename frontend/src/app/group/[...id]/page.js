"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// GroupDetails component was retired — redirect to the Roles module
export default function GroupDetailsRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/roles"); }, [router]);
    return null;
}