import GroupFormRenderer from "@/components/group/GroupFormRenderer";
import RouteGuard from "@/components/RouteGuard";

export default function addGroupPage() {
    return (
        <RouteGuard permission="groupAdd" isSuperAdminOnly>
            <GroupFormRenderer context="group-add" />
        </RouteGuard>
    );
}