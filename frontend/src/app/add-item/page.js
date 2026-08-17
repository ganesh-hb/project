import AddItem from "@/components/item/AddItem";
import RouteGuard from "@/components/RouteGuard";

export default function AddItemPage() {
    return (
        <RouteGuard permission="itemAdd">
            <AddItem />
        </RouteGuard>
    );
}
