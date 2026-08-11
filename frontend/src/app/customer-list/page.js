import CustomerList from "@/components/customer/CustomerList";
import RouteGuard from "@/components/RouteGuard";

export const metadata = {
    title: "Customers | Dashboard",
    description: "Manage customers for your company.",
};

export default function CustomerListPage() {
    return (
        <RouteGuard permission="customerList">
            <CustomerList />
        </RouteGuard>
    );
}
