import CustomerDetails from "@/components/customer/CustomerDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function CustomerDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="customerView">
            <CustomerDetails id={id} />
        </RouteGuard>
    );
}
