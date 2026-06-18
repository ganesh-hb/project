"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditUserPage from "./userUpdate";
import Header from "./Header";
import { authHeaders } from "@/app/lib/auth";

export default function UserDetailsPage({ id }) {
    const [showEdit, setShowEdit] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState({});
    const route = useRouter();

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        route.push(`http://localhost:3000${url}`);
    };

    useEffect(() => {
        getData();
        async function getData() {
            const allData = await fetch(`http://localhost:3000/relayapi`, {
                method: "GET",
                headers: { ...authHeaders(), endpoint: `user-details/${id}` },
                next: { revalidate: 60 },
            });
            const res = await allData.json();
            setUser(res);
        }
    }, [showEdit]);

    const userData = {
        ...user,
        user_userId: user.userId,
        user_name: user.name,
        user_email: user.email,
        user_phone: user.phone,
        user_status: user.status,
        user_createdBy: user.createdBy,
        user_updatedBy: user.updatedBy,
        user_userFile: user.userFile,
        user_age: user.age,
        user_createdAt: user.createdAt,
        user_updatedDate: user.updatedDate,
        assignments: user.assignments || [],
    };

    if (!userData) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-500">
                Loading...
            </div>
        );
    }

    if (showEdit) {
        return <EditUserPage user={userData} onBack={() => setShowEdit(false)} />;
    }

    const gotoBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.back();
    };

    const imageurl = `http://localhost:4000/upload/${userData.user_userId}/${userData.user_userFile}`;

    const assignments = Array.isArray(userData.assignments) ? userData.assignments : [];

    const primaryAssignment = assignments.find((a) => a.is_parent === 0) || assignments[0];

    const formattedGroupName =
        assignments.length > 0
            ? [...new Set(assignments.map((a) => a.groupName).filter(Boolean))]
                .map((n) => n.replace(/([A-Z])/g, " $1").trim())
                .join(", ")
            : "N/A";

    const formattedCompanyName =
        assignments.length > 0
            ? [...new Set(assignments.map((a) => a.companyName).filter(Boolean))].join(", ")
            : "N/A";

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return process.env.NEXT_PUBLIC_DATE_FORMAT === "yyyy-mm-dd"
            ? dateStr.split("T")[0]
            : new Date(dateStr).toLocaleDateString("en-GB").replace(/\//g, "-");
    };

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            <Header page="user-details" />

            <div className="p-6">
                {/* Breadcrumb */}
                <nav
                    className="mb-4 flex items-center space-x-2 text-sm font-medium text-gray-500"
                    aria-label="Breadcrumb"
                >
                    <span
                        className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
                        onClick={(e) => gotoPages(e, "/")}
                    >
                        Home
                    </span>
                    <span className="text-gray-400">{">>"}</span>
                    <span
                        className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
                        onClick={(e) => gotoPages(e, "/users")}
                    >
                        Users
                    </span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Details</span>
                </nav>

                {/* Header row */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Details</h1>
                    <div className="flex items-center gap-4">
                        <button
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
                            onClick={() => setShowEdit(true)}
                        >
                            Edit User
                        </button>
                        <button
                            className="px-8 h-12 rounded-md bg-gray-500 text-white font-medium hover:bg-gray-600 transition"
                            onClick={gotoBack}
                        >
                            Back
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="border-b pb-5">
                                <h2 className="text-xl font-semibold capitalize text-gray-800">
                                    {userData.user_name}
                                </h2>
                            </div>
                            <div className="mt-6 space-y-3">
                                <button className="w-full rounded-xl bg-gray-600 px-4 py-3 text-left text-white">
                                    Summary
                                </button>
                                <button className="w-full rounded-xl bg-gray-100 px-4 py-3 text-left text-gray-700 hover:bg-gray-200">
                                    Other Profiles
                                </button>
                            </div>
                            <div className="mt-8 space-y-3 text-black">
                                <div className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3">
                                    <span>Notes</span>
                                    <span className="rounded bg-white px-2 py-1 text-xs font-semibold">0</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3">
                                    <span>Activities</span>
                                    <span className="rounded bg-white px-2 py-1 text-xs font-semibold">17</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* Profile card */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4 border-b pb-5">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold uppercase text-blue-600 shadow-md">
                                        <img
                                            src={imageurl}
                                            alt="userImage"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold capitalize text-gray-800">
                                            {userData.user_name}
                                        </h2>
                                        <span
                                            className={
                                                userData.user_status === "Active"
                                                    ? "mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                                    : userData.user_status === "Inactive"
                                                        ? "mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                                                        : "mt-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-700"
                                            }
                                        >
                                            {userData.user_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-5">
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">User Name</p>
                                        <p className="font-medium text-gray-800">{userData.user_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Age</p>
                                        <p className="font-medium text-gray-800">{userData.user_age ?? "N/A"}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Role</p>
                                        <p className="font-medium text-gray-800">{formattedGroupName}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Company</p>
                                        <p className="font-medium text-gray-800">{formattedCompanyName}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Created Date</p>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(userData.user_createdAt)}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Created By</p>
                                        <p className="font-medium text-gray-800">{userData.user_createdBy}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Updated Date</p>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(userData.user_updatedDate)}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="text-gray-500">Updated By</p>
                                        <p className="font-medium text-gray-800">{userData.user_updatedBy}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-6">
                                {/* Contact Info */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm">
                                    <h3 className="mb-5 text-xl font-semibold text-gray-800">Contact Info</h3>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{userData.user_email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="font-medium text-gray-800">
                                                {userData.user_phone || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Alternate Phone Number</p>
                                            <p className="font-medium text-gray-800">
                                                {userData.user_Alternatephone || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm">
                                    <h3 className="mb-6 text-xl font-semibold text-gray-800">Remarks</h3>
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                                        <p>No Remarks found.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}