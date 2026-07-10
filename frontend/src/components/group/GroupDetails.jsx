"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import Header from "../Header";
import GroupUpdate from "./GroupUpdate";
import { loginContext } from "../hooks/LoginContext";

export default function GroupDetails({ id }) {
    const router = useRouter();
    const { can } = useContext(loginContext);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);

    useEffect(() => {
        fetchGroup();
    }, [showEdit]);

    const fetchGroup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `group-details/${id}`,
                    module: "group",
                },
            });
            const data = await res.json();
            setGroup(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        if (status === "active") return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700";
        if (status === "inactive") return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700";
        return "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f6f8]">
                <Header page="group-details" />
                <div className="p-8 text-gray-500 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-[#f5f6f8]">
                <Header page="group-details" />
                <div className="p-8 text-red-500 text-lg font-semibold">Group not found.</div>
            </div>
        );
    }

    if (showEdit) {
        return <GroupUpdate id={id} onBack={() => setShowEdit(false)} />;
    }

    const assignments = Array.isArray(group.assignments) ? group.assignments : [];

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            <Header page="group-details" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => router.push("/group-list")}>← Back to Groups</span>
            </nav>

            <div className="px-6 pb-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">{group.groupName}</h1>
                    {can("groupUpdate") && (
                        <button
                            onClick={() => setShowEdit(true)}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                        >
                            Edit Group
                        </button>
                    )}
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-sm mb-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-3">Group Information</h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 text-sm text-gray-700">
                        <div><span className="font-medium text-gray-500">Group Name:</span> {group.groupName || "-"}</div>
                        <div><span className="font-medium text-gray-500">Group Code:</span> {group.groupCode || "-"}</div>
                        <div><span className="font-medium text-gray-500">Added By:</span> {group.addedByName || "-"}</div>
                        <div><span className="font-medium text-gray-500">Updated By:</span> {group.updatedByName || "-"}</div>
                        <div>
                            <span className="font-medium text-gray-500">Status:</span>{" "}
                            <span className={statusBadge(group.status)}>{group.status.charAt(0).toUpperCase() + group.status.slice(1) || "Unknown"}</span>
                        </div>
                    </div>
                </div>

                {assignments.length > 0 && (
                    <div className="rounded-2xl bg-white p-8 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-3">Assigned Users</h2>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-gray-500 font-semibold">
                                    <th className="px-4 py-3 text-left">#</th>
                                    <th className="px-4 py-3 text-left">User Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Company</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((a, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                        <td className="px-4 py-3">{a.userName || "-"}</td>
                                        <td className="px-4 py-3">{a.userEmail || "-"}</td>
                                        <td className="px-4 py-3">{a.companyName || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}