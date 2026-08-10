import GroupCapabilities from "@/components/capabilities/GroupCapabilities";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Manage Role | Dashboard" };

export default async function RoleDetailPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="groupUpdate">
            <GroupCapabilities id={id} />
        </RouteGuard>
    );
}
