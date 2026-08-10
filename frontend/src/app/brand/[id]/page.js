import BrandDetails from "@/components/brand/BrandDetails";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Brand Details | Dashboard" };

export default async function BrandDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="brandView">
            <BrandDetails id={id} />
        </RouteGuard>
    );
}
