import UserDetailsPage from "@/components/UserDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function Page({ params }) {
    const { id } = await params;

    return (
        <RouteGuard permission="userView">
            <UserDetailsPage id={id} />
        </RouteGuard>
    );
}