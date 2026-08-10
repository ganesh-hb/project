import BrandList from "@/components/brand/BrandList";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Brand List | Dashboard" };

export default function BrandListPage() {
    return (
        <RouteGuard permission="brandList">
            <BrandList />
        </RouteGuard>
    );
}
