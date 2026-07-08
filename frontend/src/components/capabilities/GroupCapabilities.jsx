"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authHeaders, isSuperAdmin } from "@/app/lib/auth";
import Header from "../Header";
import { loginContext } from "../hooks/LoginContext";

const MODULES = [
    {
        label: "Company",
        key: "company",
        permissions: ["companyList", "companyView", "companyAdd", "companyUpdate"],
    },
    {
        label: "Group",
        key: "group",
        permissions: ["groupList", "groupView", "groupAdd", "groupUpdate"],
    },
    {
        label: "User",
        key: "user",
        permissions: ["userList", "userView", "userAdd", "userUpdate"],
    },
];

const COL_HEADERS = ["List", "View", "Add", "Update"];
const ALL_PERMS = MODULES.flatMap((m) => m.permissions);

export default function GroupCapabilities({ id }) {
    const { isLogin } = useContext(loginContext);
    const router = useRouter();
    const groupId = Number(Array.isArray(id) ? id[0] : id);

    const [superAdmin, setSuperAdmin] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [group, setGroup] = useState(null);
    const [formData, setFormData] = useState({ groupName: "", groupCode: "", status: "active" });
    const [errors, setErrors] = useState({});
    const [checked, setChecked] = useState(() => Object.fromEntries(ALL_PERMS.map((p) => [p, false])));

    useEffect(() => {
        if (isLogin) {
            setSuperAdmin(isSuperAdmin(isLogin));
        }
    }, [isLogin]);

    useEffect(() => {
        if (superAdmin === false) {
            // router.replace("/");
        }
    }, [superAdmin]);

    useEffect(() => {
        if (superAdmin === true) {
            fetchGroup();
        }
    }, [superAdmin]);

    const fetchGroup = async () => {
        setFetching(true);
        try {
            const [resGroup, resPerms] = await Promise.all([
                fetch("/relayapi", {
                    method: "GET",
                    headers: {
                        ...authHeaders(),
                        endpoint: `group-details/${groupId}`,
                        module: "group",
                    },
                }),
                fetch("/relayapi", {
                    method: "GET",
                    headers: {
                        ...authHeaders(),
                        endpoint: `group-permissions/${groupId}`,
                        module: "group",
                    },
                })
            ]);

            const groupData = await resGroup.json();
            const permsData = await resPerms.json();

            if (groupData?.groupId) {
                setGroup(groupData);
                setFormData({
                    groupName: groupData.groupName || "",
                    groupCode: groupData.groupCode || "",
                    status: groupData.status || "active",
                });
                const init = Object.fromEntries(ALL_PERMS.map((p) => [p, false]));
                if (permsData?.success === 1 && Array.isArray(permsData.permissions)) {
                    permsData.permissions.forEach((p) => { if (p in init) init[p] = true; });
                }
                setChecked(init);
            }
        } catch (err) {
            toast.error("Failed to load group.", { position: "top-right" });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePerm = (perm) => setChecked((prev) => ({ ...prev, [perm]: !prev[perm] }));

    const toggleModule = (perms) => {
        const allOn = perms.every((p) => checked[p]);
        setChecked((prev) => { const n = { ...prev }; perms.forEach((p) => { n[p] = !allOn; }); return n; });
    };

    const toggleColumn = (ci) => {
        const col = MODULES.map((m) => m.permissions[ci]).filter(Boolean);
        const allOn = col.every((p) => checked[p]);
        setChecked((prev) => { const n = { ...prev }; col.forEach((p) => { n[p] = !allOn; }); return n; });
    };

    const toggleAll = () => {
        const allOn = ALL_PERMS.every((p) => checked[p]);
        setChecked(Object.fromEntries(ALL_PERMS.map((p) => [p, !allOn])));
    };

    const validate = () => {
        const errs = {};
        if (!formData.groupName || formData.groupName.length < 2) errs.groupName = "Min 2 characters.";
        if (!formData.groupCode || formData.groupCode.length < 2) errs.groupCode = "Min 2 characters.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            await fetch("/relayapi", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                    endpoint: "group-update",
                    module: "group",
                },
                body: JSON.stringify({ groupId, ...formData }),
            });

            const permRes = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                    endpoint: "group-permissions-save",
                    module: "group",
                },
                body: JSON.stringify({
                    groupId,
                    permissions: ALL_PERMS.filter((p) => checked[p]),
                }),
            });

            const permData = await permRes.json();
            if (permData?.success === 1) {
                toast.success("Capabilities saved successfully", { position: "top-right" });
                setTimeout(() => router.push("/capabilities"), 1000);
            } else {
                toast.error(permData?.message || "Failed to save permissions.", { position: "top-right" });
            }
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 text-sm bg-white";
    const labelClass = "text-sm font-medium text-gray-700 w-40 shrink-0 pt-2.5";
    const errorClass = "mt-1 text-sm text-red-500";

    const isModuleAllOn = (perms) => perms.every((p) => checked[p]);
    const isColAllOn = (ci) => MODULES.map((m) => m.permissions[ci]).every((p) => checked[p]);
    const isAllOn = ALL_PERMS.every((p) => checked[p]);

    if (!isLogin || superAdmin !== true) {
        return null;
    }

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f5f6f8]">
                <Header page="capabilities" />
                <div className="p-8 text-gray-400 text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            <Header page="capabilities" />

            <div className="px-6 py-6">
                <nav className="mb-4 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => router.push("/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => router.push("/capabilities")}>Capabilities</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">{group?.groupName}</span>
                </nav>

                <div className="mb-6 flex items-center justify-end">

                    <button
                        onClick={() => router.push("/capabilities")}
                        className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 cursor-pointer"
                    >
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rounded-2xl bg-white p-8 shadow-sm space-y-6">

                        <div className="flex items-start gap-6">
                            <label className={labelClass}>Group Name <span className="text-red-500">*</span></label>
                            <div className="flex-1">
                                <input type="text" name="groupName" value={formData.groupName} onChange={handleChange} placeholder="Enter group name" className={inputClass} />
                                {errors.groupName && <p className={errorClass}>{errors.groupName}</p>}
                            </div>
                        </div>
                        <div className="flex items-start gap-6">
                            <label className={labelClass}>Group Code <span className="text-red-500">*</span></label>
                            <div className="flex-1">
                                <input type="text" name="groupCode" value={formData.groupCode} onChange={handleChange} placeholder="e.g. GRP01" className={inputClass} />
                                {errors.groupCode && <p className={errorClass}>{errors.groupCode}</p>}
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <label className={labelClass}>Status <span className="text-red-500">*</span></label>
                            <div className="flex-1">
                                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                    <option value="block">Block</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <label className={`${labelClass} mt-1`}>Select Modules <span className="text-red-500">*</span></label>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="w-8 py-3 text-left">
                                                <input type="checkbox" checked={isAllOn} onChange={toggleAll} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                                            </th>
                                            <th className="py-3 text-left text-gray-500 font-semibold w-36 pl-2">Module</th>
                                            {COL_HEADERS.map((h, ci) => (
                                                <th key={h} className="py-3 text-center px-6">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <input type="checkbox" checked={isColAllOn(ci)} onChange={() => toggleColumn(ci)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                                                        <span className="text-gray-500 font-semibold">{h}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MODULES.map((mod) => (
                                            <tr key={mod.key} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3.5">
                                                    <input type="checkbox" checked={isModuleAllOn(mod.permissions)} onChange={() => toggleModule(mod.permissions)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                                                </td>
                                                <td className="py-3.5 pl-2 font-medium text-gray-700">{mod.label}</td>
                                                {mod.permissions.map((perm) => (
                                                    <td key={perm} className="py-3.5 text-center px-6">
                                                        <input type="checkbox" checked={!!checked[perm]} onChange={() => togglePerm(perm)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => router.push("/capabilities")} className="rounded-lg bg-gray-200 px-8 py-2.5 font-medium text-gray-700 hover:bg-gray-300 transition cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-8 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer">
                            {loading ? "Saving..." : "Save Capabilities"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}