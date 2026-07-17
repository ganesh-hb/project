import CurrencyList from "@/components/currency/CurrencyList";
import RouteGuard from "@/components/RouteGuard";

export default function Currencies() {
    return (
        <RouteGuard permission="currencyList">
            <CurrencyList />
        </RouteGuard>
    );
}
