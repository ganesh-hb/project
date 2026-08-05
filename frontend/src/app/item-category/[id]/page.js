import ItemCategoryDetails from "@/components/itemCategory/ItemCategoryDetails";
import RouteGuard from "@/components/RouteGuard";

export default async function ItemCategoryDetailsPage({ params }) {
    const { id } = await params;
    return (
        <RouteGuard permission="itemCategoryView">
            <ItemCategoryDetails id={id} />
        </RouteGuard>
    );
}
