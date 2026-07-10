import ActivityList from '@/components/activity/ActivityList';
import RouteGuard from "@/components/RouteGuard";

export default function Activity() {
  return (
    <RouteGuard permission="userList">
      <ActivityList />
    </RouteGuard>
  );
}
