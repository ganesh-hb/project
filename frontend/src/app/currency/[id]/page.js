import CurrencyDetails from "@/components/currency/CurrencyDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function CurrencyDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="currencyView">
            <CurrencyDetails id={id} />
        </RouteGuard>
    );
}
