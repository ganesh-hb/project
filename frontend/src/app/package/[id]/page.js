import PackageDetails from "@/components/package/PackageDetails";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Package Details | Dashboard" };

export default async function PackageDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="packageView">
            <PackageDetails id={id} />
        </RouteGuard>
    );
}
