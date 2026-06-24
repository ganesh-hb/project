import GroupDetails from "@/components/group/GroupDetails";

export default async function GroupDetailsPage({ params }) {
    const { id } = await params;
    return <GroupDetails id={id} />;
}