import GroupList from "@/components/group/groupList";
import RouteGuard from "@/components/RouteGuard";

export default function Groups() {
    return (
        <RouteGuard permission="groupList">
            <GroupList />
        </RouteGuard>
    );
}