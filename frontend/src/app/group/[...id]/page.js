import GroupDetails from "@/components/group/GroupDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function GroupDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="groupView">
            <GroupDetails id={id} />
        </RouteGuard>
    );
}