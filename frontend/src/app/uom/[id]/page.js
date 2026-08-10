import UomDetails from "@/components/uom/UomDetails";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "UOM Details | Dashboard" };

export default async function UomDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="uomView">
            <UomDetails id={id} />
        </RouteGuard>
    );
}
