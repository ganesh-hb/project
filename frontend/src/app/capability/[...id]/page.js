import GroupCapabilities from "@/components/capabilities/GroupCapabilities";
import RouteGuard from "@/components/RouteGuard";

export default async function GroupCapabilitiesPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard isSuperAdminOnly>
            <GroupCapabilities id={id} />
        </RouteGuard>
    );
}