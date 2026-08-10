import PackageList from "@/components/package/PackageList";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Package List | Dashboard" };

export default function PackageListPage() {
    return (
        <RouteGuard permission="packageList">
            <PackageList />
        </RouteGuard>
    );
}
