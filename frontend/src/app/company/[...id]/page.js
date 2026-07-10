import CompanyDetails from "@/components/company/CompanyDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function CompanyDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="companyView">
            <CompanyDetails id={id} />
        </RouteGuard>
    );
}