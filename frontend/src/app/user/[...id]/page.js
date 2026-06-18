import UserDetailsPage from "@/components/UserDetails";

export default async function Page({ params }) {
    const { id } = await params;

    return (
        <>
            <UserDetailsPage id={id} />
        </>
    )
}