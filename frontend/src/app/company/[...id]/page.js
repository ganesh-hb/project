import CompanyDetails from "@/components/company/CompanyDetails";

export default async function CompanyDetailsPage({ params }) {
    const { id } = await params;
    return <CompanyDetails id={id} />;
}