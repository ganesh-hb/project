import AddGroup from "@/components/group/AddGroup";
import RouteGuard from "@/components/RouteGuard";

export default function addGroupPage() {
    return (
        <RouteGuard permission="groupAdd" isSuperAdminOnly>
            <AddGroup />
        </RouteGuard>
    );
}