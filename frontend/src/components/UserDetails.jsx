"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditUserPage from "./userUpdate";
import { useContext } from "react";
import { loginContext } from "./hooks/LoginContext";
import Header from "./Header";
import { authHeaders } from "@/app/lib/auth";

export default function UserDetailsPage({ id }) {
    const [showEdit, setShowEdit] = useState(false);
    const { can, canAny } = useContext(loginContext);
    const [activeTab, setActiveTab] = useState("summary");
    const [user, setUser] = useState({});
    const [groups, setGroups] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showAddProfile, setShowAddProfile] = useState(false);
    const [addForm, setAddForm] = useState({ groupId: "", companyId: "", isActive: "Active" });
    const [addError, setAddError] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
    const router = useRouter();
    const route = useRouter();
    const { switchProfile } = useContext(loginContext);
    const [imgPreview, setImgPreview] = useState(false);

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        route.push(`http://localhost:3000${url}`);
    };

    const fetchUser = async (profileId = null) => {
        const headers = { ...authHeaders(), endpoint: `user-details/${id}` };
        if (profileId) headers["x-profile-id"] = String(profileId);
        const allData = await fetch(`http://localhost:3000/relayapi`, {
            method: "GET",
            headers,
        });
        const res = await allData.json();
        setUser(res);
    };

    useEffect(() => {
        fetchUser();
    }, [showEdit]);

    useEffect(() => {
        if (showAddProfile && groups.length === 0) {
            fetchDropdowns();
        }
    }, [showAddProfile]);

    const fetchDropdowns = async () => {
        const [gRes, cRes] = await Promise.all([
            fetch(`http://localhost:3000/relayapi`, {
                method: "POST",
                headers: { ...authHeaders(), endpoint: "group-list", service: "group", "Content-Type": "application/json" },
                body: JSON.stringify({ page: 1, limit: 200 }),
            }),
            fetch(`http://localhost:3000/relayapi`, {
                method: "POST",
                headers: { ...authHeaders(), endpoint: "company-list", service: "company", "Content-Type": "application/json" },
                body: JSON.stringify({ page: 1, limit: 200 }),
            }),
        ]);
        const gData = await gRes.json();
        const cData = await cRes.json();
        setGroups(gData?.data || []);
        setCompanies(cData?.data || []);
    };

    const handleAddProfile = async () => {
        setAddError("");
        if (!addForm.groupId || !addForm.companyId) {
            setAddError("Please select both a group and a company.");
            return;
        }
        setAddLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/relayapi`, {
                method: "POST",
                headers: { ...authHeaders(), endpoint: "user-add-profile", "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: Number(id),
                    groupId: Number(addForm.groupId),
                    companyId: Number(addForm.companyId),
                    isActive: addForm.isActive,
                }),
            });
            const data = await res.json();
            if (data?.success === 1) {
                setShowAddProfile(false);
                setAddForm({ groupId: "", companyId: "", isActive: "Active" });
                await fetchUser();
            } else {
                setAddError(data?.message || "Failed to add profile.");
            }
        } catch {
            setAddError("Something went wrong.");
        } finally {
            setAddLoading(false);
        }
    };

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

    const selectedAssignment = user.activeAssignment || assignments[selectedProfileIndex] || null;

    const formattedGroupName = selectedAssignment?.groupName
        ? selectedAssignment.groupName.replace(/([A-Z])/g, " $1").trim()
        : "N/A";

    const formattedCompanyName = selectedAssignment?.companyName || "N/A";

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return process.env.NEXT_PUBLIC_DATE_FORMAT === "yyyy-mm-dd"
            ? dateStr.split("T")[0]
            : new Date(dateStr).toLocaleDateString("en-GB").replace(/\//g, "-");
    };

    const statusBadge = (status) => {
        if (status === "Active") return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700";
        if (status === "Inactive") return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700";
        return "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700";
    };

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            <Header page="user-details" />

            <div className="p-6">
                {/* Breadcrumb */}
                <nav className="mb-4 flex items-center space-x-2 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
                    <span className="cursor-pointer transition-colors hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="cursor-pointer transition-colors hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/users")}>Users</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Details</span>
                </nav>

                {/* Header row */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Details</h1>
                    <div className="flex items-center gap-4">
                        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer" onClick={() => setShowEdit(true)}>
                            Edit User
                        </button>
                        <button className="px-8 h-12 rounded-md bg-gray-500 text-white font-medium hover:bg-gray-600 transition cursor-pointer" onClick={gotoBack}>
                            Back
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="border-b pb-5">
                                <h2 className="text-xl font-semibold capitalize text-gray-800">{userData.user_name}</h2>
                            </div>
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={() => setActiveTab("summary")}
                                    className={`w-full rounded-xl px-4 py-3 text-left font-medium transition cursor-pointer ${activeTab === "summary" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab("profiles")}
                                    className={`w-full rounded-xl px-4 py-3 text-left font-medium transition cursor-pointer ${activeTab === "profiles" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    Other Profiles
                                    {assignments.length > 0 && (
                                        <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 cursor-pointer">{assignments.length}</span>
                                    )}
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

                        {/* ── SUMMARY TAB ── */}
                        {activeTab === "summary" && (
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Profile card */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-4 border-b pb-5">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold uppercase text-blue-600 shadow-md">
                                            <img
                                                src={imageurl}
                                                alt="userImage"
                                                className="h-full w-full object-cover cursor-pointer"
                                                onClick={() => setImgPreview(true)}
                                            />
                                            {imgPreview && (
                                                <div
                                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                                                    onClick={() => setImgPreview(false)}
                                                >
                                                    <div
                                                        className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm w-full mx-4"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                                                            onClick={() => setImgPreview(false)}
                                                        >
                                                            ✕
                                                        </button>
                                                        <img src={imageurl} alt="preview" className="w-full rounded-xl object-contain max-h-80" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold capitalize text-gray-800">{userData.user_name}</h2>
                                            <span className={userData.user_status === "Active"
                                                ? "mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                                : userData.user_status === "Inactive"
                                                    ? "mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                                                    : "mt-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-700"
                                            }>
                                                {userData.user_status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-5">
                                        <div className="grid grid-cols-2"><p className="text-gray-500">User Name</p><p className="font-medium text-gray-800">{userData.user_name}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Age</p><p className="font-medium text-gray-800">{userData.user_age ?? "N/A"}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Role</p><p className="font-medium text-gray-800">{formattedGroupName}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Company</p><p className="font-medium text-gray-800">{formattedCompanyName}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Created Date</p><p className="font-medium text-gray-800">{formatDate(userData.user_createdAt)}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Created By</p><p className="font-medium text-gray-800">{userData.user_createdBy}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Updated Date</p><p className="font-medium text-gray-800">{formatDate(userData.user_updatedDate)}</p></div>
                                        <div className="grid grid-cols-2"><p className="text-gray-500">Updated By</p><p className="font-medium text-gray-800">{userData.user_updatedBy}</p></div>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="space-y-6">
                                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                                        <h3 className="mb-5 text-xl font-semibold text-gray-800">Contact Info</h3>
                                        <div className="space-y-5">
                                            <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-800">{userData.user_email}</p></div>
                                            <div><p className="text-sm text-gray-500">Phone Number</p><p className="font-medium text-gray-800">{userData.user_phone || "N/A"}</p></div>
                                            <div><p className="text-sm text-gray-500">Alternate Phone Number</p><p className="font-medium text-gray-800">{userData.user_Alternatephone || "-"}</p></div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                                        <h3 className="mb-6 text-xl font-semibold text-gray-800">Remarks</h3>
                                        <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                                            <p>No Remarks found.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── OTHER PROFILES TAB ── */}
                        {activeTab === "profiles" && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-800">Profiles</h3>
                                    <button
                                        onClick={() => setShowAddProfile(true)}
                                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                                    >
                                        + Add Profile
                                    </button>
                                </div>

                                {assignments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <p className="text-lg">No profiles found.</p>
                                        <p className="text-sm mt-1">Click "Add Profile" to assign this user to a company and role.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {assignments.map((a, i) => (
                                            <div
                                                key={a.id || i}
                                                className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition ${selectedProfileIndex === i ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Profile {i + 1}</span>
                                                    {selectedProfileIndex === i && (
                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Active</span>
                                                    )}
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400">Company</p>
                                                        <p className="font-semibold text-gray-800">{a.companyName || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400">Role</p>
                                                        <p className="font-medium text-gray-700">
                                                            {a.groupName ? a.groupName.replace(/([A-Z])/g, " $1").trim() : "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {selectedProfileIndex !== i && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProfileIndex(i);
                                                            switchProfile(a);
                                                            fetchUser(a.id);
                                                            setActiveTab("summary");
                                                        }}
                                                        className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
                                                    >
                                                        Set as Active
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAddProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
                        <h3 className="mb-6 text-xl font-semibold text-gray-800">Add Profile</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600">Group / Role</label>
                                <select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                                    value={addForm.groupId}
                                    onChange={(e) => setAddForm((f) => ({ ...f, groupId: e.target.value }))}
                                >
                                    <option value="">Select a group</option>
                                    {groups.map((g) => (
                                        <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600">Company</label>
                                <select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                                    value={addForm.companyId}
                                    onChange={(e) => setAddForm((f) => ({ ...f, companyId: e.target.value }))}
                                >
                                    <option value="">Select a company</option>
                                    {companies.map((c) => (
                                        <option key={c.companyId} value={c.companyId}>{c.companyName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600">Status</label>
                                <select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                                    value={addForm.isActive}
                                    onChange={(e) => setAddForm((f) => ({ ...f, isActive: e.target.value }))}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {addError && <p className="text-sm text-red-600">{addError}</p>}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowAddProfile(false); setAddError(""); setAddForm({ groupId: "", companyId: "", isActive: "Active" }); }}
                                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProfile}
                                disabled={addLoading}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {addLoading ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}