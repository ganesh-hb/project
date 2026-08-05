import UsersPage from "@/components/user/UserList";
import RouteGuard from "@/components/RouteGuard";

export default function Users() {
    return (
        <RouteGuard permission="userList">
            <UsersPage />
        </RouteGuard>
    );
}