// import { GroupFormSchema } from "@/components/Zod";

// export const groupFormConfig = {
//     contexts: {
//         "group-add": {
//             mode: "add",
//             title: "Add Group",
//             headerPage: "group-add",
//             breadcrumbs: [
//                 { label: "Home", url: "/" },
//                 { label: "Roles", url: "/roles" },
//                 { label: "Add Role", active: true }
//             ],
//             api: {
//                 method: "POST",
//                 endpoint: "group-add",
//                 module: "group",
//             },
//             schema: GroupFormSchema,
//             submitButtonText: "Add Group",
//             loadingButtonText: "Creating...",
//             successMessage: "Group created successfully",
//             onSuccessAction: "navigate",
//             successRedirectUrl: "/roles",
//             cancelAction: "navigate",
//             cancelRedirectUrl: "/roles",
//             fields: [
//                 {
//                     name: "groupName",
//                     label: "Group Name",
//                     type: "text",
//                     placeholder: "Enter group name",
//                     required: true,
//                     defaultValue: "",
//                     readOnly: false,
//                     hidden: false
//                 },
//                 {
//                     name: "groupCode",
//                     label: "Group Code",
//                     type: "text",
//                     placeholder: "e.g. GRP01",
//                     required: true,
//                     defaultValue: "",
//                     readOnly: false,
//                     hidden: false
//                 },
//                 {
//                     name: "status",
//                     label: "Status",
//                     type: "select",
//                     required: true,
//                     defaultValue: "active",
//                     readOnly: false,
//                     hidden: false,
//                     options: [
//                         { label: "Active", value: "active" },
//                         { label: "Inactive", value: "inactive" }
//                     ]
//                 }
//             ]
//         },
//         "group-update": {
//             mode: "update",
//             title: "Edit Group",
//             headerPage: "group-update",
//             breadcrumbs: [
//                 { label: "Home", url: "/" },
//                 { label: "Roles", url: "/roles" },
//                 { label: "Update Role", active: true }
//             ],
//             api: {
//                 fetchEndpoint: "group-details",
//                 method: "PUT",
//                 endpoint: "group-update",
//                 module: "group",
//             },
//             schema: GroupFormSchema,
//             submitButtonText: "Update Group",
//             loadingButtonText: "Updating...",
//             successMessage: "Group updated successfully",
//             onSuccessAction: "callback",
//             cancelAction: "callback",
//             fields: [
//                 {
//                     name: "groupName",
//                     label: "Group Name",
//                     type: "text",
//                     placeholder: "Enter group name",
//                     required: true,
//                     defaultValue: "",
//                     readOnly: false,
//                     hidden: false
//                 },
//                 {
//                     name: "groupCode",
//                     label: "Group Code",
//                     type: "text",
//                     placeholder: "e.g. GRP01",
//                     required: true,
//                     defaultValue: "",
//                     readOnly: true,
//                     hidden: false
//                 },
//                 {
//                     name: "status",
//                     label: "Status",
//                     type: "select",
//                     required: true,
//                     defaultValue: "active",
//                     readOnly: false,
//                     hidden: false,
//                     options: [
//                         { label: "Active", value: "active" },
//                         { label: "Inactive", value: "inactive" }
//                     ]
//                 }
//             ]
//         }
//     }
// };
