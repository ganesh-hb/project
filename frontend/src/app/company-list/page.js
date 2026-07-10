import CompanyList from "@/components/company/companyList";
import RouteGuard from "@/components/RouteGuard";

export default function companies() {
    return (
        <RouteGuard permission="companyList">
            <CompanyList />
        </RouteGuard>
    );
}