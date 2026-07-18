import AddCurrency from "@/components/currency/AddCurrency";
import RouteGuard from "@/components/RouteGuard";

export default function AddCurrencyPage() {
    return (
        <RouteGuard permission="currencyAdd">
            <AddCurrency />
        </RouteGuard>
    );
}
