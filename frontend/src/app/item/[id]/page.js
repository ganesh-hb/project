import ItemDetails from "@/components/item/ItemDetails";
import RouteGuard from "@/components/RouteGuard";

export const metadata = { title: "Item Details | Dashboard" };

// ⚠️ RouteGuard permission="itemView" — verify "itemView" key is registered in capabilities before enabling.
export default async function ItemDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="itemView">
            <ItemDetails id={id} />
        </RouteGuard>
    );
}
