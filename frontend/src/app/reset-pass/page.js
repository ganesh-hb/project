// import ChangePassword from "@/components/ChnagePass";

// export default async function ChangePasswordPage({ params }) {
//     const resolvedParams = await params;

//     const allData = await fetch(`http://localhost:3000/relayapi`, {
//         method: "GET",
//         headers: {
//             endpoint: `user-changepass`,
//             data: JSON.stringify(resolvedParams)
//         },
//         next: { revalidate: 60 }
//     });

//     let res = await allData.json();

//     return (
//         <>
//             <ChangePassword initialData={res} />
//         </>
//     );
// }

import ChangePassword from "@/components/ChnagePass";

export default function ChangePasswordPage() {
    return <ChangePassword />;
}
