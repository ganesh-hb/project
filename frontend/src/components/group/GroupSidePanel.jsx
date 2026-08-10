// "use client";
// import { useEffect, useState } from "react";
// import { authHeaders } from "@/app/lib/auth";
// import { decryptResponse } from "@/app/lib/crypto";
// import SidePanel from "../common/SidePanel";
// import { getInitials, formatStatus } from "@/lib/utils";

// export default function GroupSidePanel({ groupId, onClose, onMoreDetails }) {
//     const [group, setGroup] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!groupId) return;
//         fetchGroup();
//     }, [groupId]);

//     const fetchGroup = async () => {
//         setLoading(true);
//         try {
//             const res = await fetch("/relayapi", {
//                 method: "GET",
//                 headers: {
//                     ...authHeaders(),
//                     endpoint: `group-details/${groupId}`,
//                     module: "group",
//                 },
//             });
//             const resJson = await res.json();
//             const data = resJson?.encrypted ? decryptResponse(resJson.encrypted) : resJson;
//             setGroup(data);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const assignments = Array.isArray(group?.assignments) ? group.assignments : [];

//     const sections = group
//         ? [
//               {
//                   title: "Basic Info",
//                   rows: [
//                       { label: "Group Name", value: group.groupName || "-" },
//                       { label: "Group Code", value: group.groupCode || "-" },
//                       { label: "Added By", value: group.addedByName || "-" },
//                       { label: "Updated By", value: group.updatedByName || "-" },
//                   ],
//               },
//           ]
//         : [];

//     const customContent =
//         assignments.length > 0 ? (
//             <div className="px-6 py-4">
//                 <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
//                     Assigned Users
//                 </h4>
//                 <div className="space-y-2 max-h-60 overflow-y-auto">
//                     {assignments.map((a, i) => (
//                         <div
//                             key={i}
//                             className="p-2.5 rounded-lg border bg-gray-50 flex flex-col text-xs space-y-0.5 transition-colors hover:bg-gray-100"
//                         >
//                             <span className="font-semibold text-gray-800">{a.userName || a.name || "-"}</span>
//                             {a.email && <span className="text-gray-500">{a.email}</span>}
//                             {a.companyName && <span className="text-gray-400">{a.companyName}</span>}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ) : null;

//     return (
//         <SidePanel
//             onClose={onClose}
//             loading={loading}
//             errorType={!group && !loading ? "not-found" : null}
//             title="Group Details"
//             avatar={null}
//             initials={getInitials(group?.groupName)}
//             name={group?.groupName || ""}
//             subtitle={group?.groupCode || "-"}
//             status={formatStatus(group?.status)}
//             onMoreDetails={onMoreDetails}
//             moreDetailsId={groupId}
//             sections={sections}
//             customContent={customContent}
//         />
//     );
// }
