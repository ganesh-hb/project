import CapabilitiesList from "@/components/capabilities/Capabilities";
import RouteGuard from "@/components/RouteGuard";

export default function CapabilitiesPage() {
    return (
        <RouteGuard isSuperAdminOnly>
            <CapabilitiesList />
        </RouteGuard>
    );
}