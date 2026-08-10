import RolesList from "@/components/roles/RolesList";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Roles | Dashboard" };

export default function RolesPage() {
    return (
        <RouteGuard permission="groupList">
            <RolesList />
        </RouteGuard>
    );
}
