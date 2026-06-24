import GroupCapabilities from "@/components/capabilities/GroupCapabilities";

export default async function GroupCapabilitiesPage({ params }) {
    const { id } = await params;
    return <GroupCapabilities id={id} />;
}