import ItemList from "@/components/item/ItemList";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Item List | Dashboard" };

export default function ItemListPage() {
    return (
        <RouteGuard permission="itemList">
            <ItemList />
        </RouteGuard>
    );
}
