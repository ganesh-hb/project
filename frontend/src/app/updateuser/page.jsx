import EditUserPage from "@/components/userUpdate";

export default async function updateUser({ params }) {
    const { id } = await params;
    const allData = await fetch(`http://localhost:4000/user/user-details/${id}`, {
        method: "GET",
        endpoint: id,
        next: { revalidate: 60 }
    });
    let res = await allData.json();
    return (
        <>
            <EditUserPage user={res} />
        </>
    )
}