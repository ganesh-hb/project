import AddCustomer from "@/components/customer/AddCustomer";
import RouteGuard from "@/components/RouteGuard";

export const metadata = {
    title: "Add Customer | Dashboard",
    description: "Create a new customer.",
};

export default function AddCustomerPage() {
    return (
        <RouteGuard permission="customerAdd">
            <AddCustomer />
        </RouteGuard>
    );
}
