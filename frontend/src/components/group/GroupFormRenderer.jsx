// "use client";
// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";
// import Header from "../Header";
// import Loader from "../ui/Loader";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import { authHeaders } from "@/app/lib/auth";
// import { decryptResponse } from "@/app/lib/crypto";
// import { groupFormConfig } from "./configs/groupForm.config";

// const MySwal = withReactContent(Swal);

// export default function GroupFormRenderer({ context = "group-add", id, onBack }) {
//     const router = useRouter();
//     const config = groupFormConfig.contexts[context] || groupFormConfig.contexts["group-add"];

//     const initialFormData = config.fields.reduce((acc, field) => {
//         acc[field.name] = field.defaultValue ?? "";
//         return acc;
//     }, {});

//     const [formData, setFormData] = useState(initialFormData);
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [fetching, setFetching] = useState(config.mode === "update");

//     useEffect(() => {
//         if (config.mode === "update" && id) {
//             fetchGroupDetails();
//         } else {
//             setFetching(false);
//         }
//     }, [context, id]);

//     const fetchGroupDetails = async () => {
//         setFetching(true);
//         try {
//             const numericId = Number(Array.isArray(id) ? id[0] : id);
//             const endpoint = `${config.api.fetchEndpoint}/${numericId}`;
//             const res = await fetch("/relayapi", {
//                 method: "GET",
//                 headers: {
//                     ...authHeaders(),
//                     endpoint,
//                     module: config.api.module,
//                 },
//             });
//             const resJson = await res.json();
//             const data = resJson?.encrypted ? decryptResponse(resJson.encrypted) : resJson;
//             if (data?.groupId) {
//                 setFormData({
//                     groupName: data.groupName || "",
//                     groupCode: data.groupCode || "",
//                     status: data.status || "active",
//                 });
//             }
//         } catch (err) {
//             toast.error("Failed to load group data.", { position: "top-right" });
//         } finally {
//             setFetching(false);
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setErrors((prev) => ({ ...prev, [name]: "" }));
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const gotoPages = async (e, url) => {
//         if (e) {
//             e.stopPropagation();
//             e.preventDefault();
//         }
//         const result = await MySwal.fire({
//             title: "Discard changes?",
//             text: "Any unsaved data will be lost.",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#d33",
//             cancelButtonColor: "#6b7280",
//             confirmButtonText: "Yes, go back",
//             cancelButtonText: "Stay",
//         });
//         if (result.isConfirmed) {
//             if (url === "/group" && onBack) {
//                 onBack();
//             } else {
//                 router.push(url);
//             }
//         }
//     };

//     const handleCancel = async () => {
//         const result = await MySwal.fire({
//             title: "Discard changes?",
//             text: "Any unsaved data will be lost.",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#d33",
//             cancelButtonColor: "#6b7280",
//             confirmButtonText: config.mode === "update" ? "Yes, discard" : "Yes, go back",
//             cancelButtonText: "Stay",
//         });
//         if (result.isConfirmed) {
//             if (config.cancelAction === "callback" && onBack) {
//                 onBack();
//             } else if (config.cancelRedirectUrl) {
//                 router.push(config.cancelRedirectUrl);
//             } else if (onBack) {
//                 onBack();
//             }
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const result = config.schema.safeParse(formData);
//         if (!result.success) {
//             const fieldErrors = {};
//             result.error.issues.forEach((err) => {
//                 const field = err.path[0];
//                 if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
//             });
//             setErrors(fieldErrors);
//             return;
//         }

//         setLoading(true);
//         try {
//             const payload = config.mode === "update"
//                 ? { groupId: Number(Array.isArray(id) ? id[0] : id), ...formData }
//                 : formData;

//             const headers = {
//                 "Content-Type": "application/json",
//                 endpoint: config.api.endpoint,
//                 module: config.api.module,
//             };

//             const response = await fetch("/relayapi", {
//                 method: config.api.method,
//                 headers,
//                 body: JSON.stringify(payload),
//             });

//             const resJson = await response.json();
//             const data = resJson?.encrypted ? decryptResponse(resJson.encrypted) : resJson;

//             if (data?.settings?.success === 1 || data?.status?.success === 1 || response.ok) {
//                 toast.success(config.successMessage, { position: "top-right" });
//                 setTimeout(() => {
//                     if (config.onSuccessAction === "callback" && onBack) {
//                         onBack();
//                     } else if (config.successRedirectUrl) {
//                         router.push(config.successRedirectUrl);
//                     } else if (onBack) {
//                         onBack();
//                     }
//                 }, 1000);
//             } else {
//                 toast.error(data?.message || data?.settings?.message || JSON.stringify(data) || "Operation failed.", { position: "top-right" });
//             }
//         } catch (err) {
//             toast.error(`${err}`, { position: "top-right" });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-sm";
//     const labelClass = "mb-2 block text-sm font-medium text-gray-700";
//     const errorClass = "mt-1 text-sm text-red-500";

//     if (fetching) {
//         return (
//             <div className="min-h-screen bg-[#f5f6f8]">
//                 <Header page={config.headerPage} />
//                 <div className="flex items-center justify-center py-20">
//                     <Loader label="Loading group data..." />
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
//             <Header page={config.headerPage} />

//             <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
//                 {config.breadcrumbs.map((crumb, idx) => (
//                     <span key={idx} className="flex items-center space-x-2">
//                         {idx > 0 && <span className="text-gray-400">{">>"}</span>}
//                         {crumb.active ? (
//                             <span className="text-gray-800">{crumb.label}</span>
//                         ) : (
//                             <span
//                                 className="cursor-pointer hover:text-blue-600 hover:underline"
//                                 onClick={(e) => gotoPages(e, crumb.url)}
//                             >
//                                 {crumb.label}
//                             </span>
//                         )}
//                     </span>
//                 ))}
//             </nav>

//             <div className="px-6">
//                 <div className="mb-8 flex items-center justify-between">
//                     <h1 className={`mt-1 text-3xl font-semibold text-gray-800 ${config.mode === "update" ? "cursor-pointer" : ""}`}>
//                         {config.title}
//                     </h1>
//                 </div>

//                 <div className={config.mode === "update" ? "w-full rounded-2xl bg-white p-8 shadow-sm" : ""}>
//                     <form onSubmit={handleSubmit}>
//                         <div className={config.mode === "add" ? "rounded-2xl bg-white p-8 shadow-sm" : ""}>
//                             {config.mode === "add" && (
//                                 <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Group Information</h2>
//                             )}

//                             <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                                 {config.fields.filter(f => !f.hidden).map((field) => (
//                                     <div key={field.name}>
//                                         <label className={labelClass}>
//                                             {field.label} {field.required && <span className="text-red-500">*</span>}
//                                         </label>

//                                         {field.type === "select" ? (
//                                             <select
//                                                 name={field.name}
//                                                 value={formData[field.name]}
//                                                 onChange={handleChange}
//                                                 disabled={field.readOnly}
//                                                 className={inputClass}
//                                             >
//                                                 {field.options?.map((opt) => (
//                                                     <option key={opt.value} value={opt.value}>
//                                                         {opt.label}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         ) : (
//                                             <input
//                                                 type={field.type || "text"}
//                                                 name={field.name}
//                                                 value={formData[field.name]}
//                                                 onChange={handleChange}
//                                                 readOnly={field.readOnly}
//                                                 placeholder={field.placeholder}
//                                                 className={inputClass}
//                                             />
//                                         )}

//                                         {errors[field.name] && <p className={errorClass}>{errors[field.name]}</p>}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="mt-8 mb-10 flex justify-center gap-4">
//                             <button
//                                 type="button"
//                                 onClick={handleCancel}
//                                 className={
//                                     config.mode === "update"
//                                         ? "rounded-xl bg-gray-200 px-8 py-3 font-medium text-gray-700 hover:bg-gray-300 transition cursor-pointer"
//                                         : "px-6 py-2 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
//                                 }
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className={
//                                     config.mode === "update"
//                                         ? "cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
//                                         : "rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
//                                 }
//                             >
//                                 {loading ? config.loadingButtonText : config.submitButtonText}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }
