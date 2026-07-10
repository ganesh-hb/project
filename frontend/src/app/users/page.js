import UsersPage from "@/components/UserList";
import RouteGuard from "@/components/RouteGuard";

export default function Users() {
    return (
        <RouteGuard permission="userList">
            <UsersPage />
        </RouteGuard>
    );
}