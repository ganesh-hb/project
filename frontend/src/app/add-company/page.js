import AddCompany from "@/components/company/AddCompany";
import RouteGuard from "@/components/RouteGuard";

export default function AddCompanyPage() {
    return (
        <RouteGuard permission="companyAdd">
            <AddCompany />
        </RouteGuard>
    );
}