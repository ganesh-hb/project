import UomList from "@/components/uom/UomList";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "UOM List | Dashboard" };

export default function UomListPage() {
    return (
        <RouteGuard permission="uomList">
            <UomList />
        </RouteGuard>
    );
}
