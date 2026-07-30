import CurrencyFormRenderer from "@/components/currency/CurrencyFormRenderer";
import RouteGuard from "@/components/RouteGuard";

export default function AddCurrencyPage() {
    return (
        <RouteGuard permission="currencyAdd">
            <CurrencyFormRenderer context="currency-add" />
        </RouteGuard>
    );
}
