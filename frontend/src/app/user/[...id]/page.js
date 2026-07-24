import { Suspense } from "react";
import UserDetailsPage from "@/components/UserDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function Page({ params }) {
    const { id } = await params;

    return (
        <RouteGuard permission="userView">
            <Suspense fallback={null}>
                <UserDetailsPage id={id} />
            </Suspense>
        </RouteGuard>
    );
}