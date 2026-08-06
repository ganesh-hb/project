import ManufacturerDetails from "@/components/manufacturer/ManufacturerDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function ManufacturerDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="manufacturerView">
            <ManufacturerDetails id={id} />
        </RouteGuard>
    );
}
