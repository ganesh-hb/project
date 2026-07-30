import { CurrencyFormSchema, CurrencyUpdateSchema } from "../../Zod";

export const currencyFormConfig = {
    contexts: {
        "currency-add": {
            mode: "add",
            title: "Add Currency",
            headerPage: "currency-add",
            breadcrumbs: [
                { label: "Home", url: "/" },
                { label: "Currencies", url: "/currency-list" },
                { label: "Add Currency", active: true }
            ],
            api: {
                method: "POST",
                endpoint: "currency-add",
                module: "currency",
            },
            schema: CurrencyFormSchema,
            submitButtonText: "Add Currency",
            loadingButtonText: "Creating...",
            successMessage: "Currency created successfully",
            onSuccessAction: "navigate",
            successRedirectUrl: "/currency-list",
            cancelAction: "navigate",
            cancelRedirectUrl: "/currency-list",
            fields: [
                {
                    name: "name",
                    label: "Currency Name",
                    type: "text",
                    placeholder: "e.g. US Dollar",
                    required: true,
                    defaultValue: "",
                    readOnly: false,
                    hidden: false
                },
                {
                    name: "code",
                    label: "Currency Code",
                    type: "text",
                    placeholder: "e.g. USD",
                    required: true,
                    defaultValue: "",
                    readOnly: false,
                    hidden: false
                },
                {
                    name: "symbol",
                    label: "Currency Symbol",
                    type: "text",
                    placeholder: "e.g. $",
                    required: true,
                    defaultValue: "",
                    readOnly: false,
                    hidden: false
                },
                {
                    name: "conversionRate",
                    label: "Conversion Rate",
                    type: "text",
                    placeholder: "e.g. 1.0",
                    required: true,
                    defaultValue: "",
                    readOnly: false,
                    hidden: false
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: "Active",
                    readOnly: false,
                    hidden: false,
                    options: [
                        { label: "Active", value: "Active" },
                        { label: "Inactive", value: "Inactive" }
                    ]
                }
            ]
        },
        "currency-update": {
            mode: "update",
            title: "Edit Currency",
            headerPage: "currency-update",
            breadcrumbs: [
                { label: "Home", url: "/" },
                { label: "Currencies", url: "/currency-list" },
                { label: "Edit Currency", active: true }
            ],
            api: {
                fetchEndpoint: "currency-details",
                method: "PUT",
                endpoint: "currency-update",
                module: "currency",
            },
            schema: CurrencyUpdateSchema,
            submitButtonText: "Update Currency",
            loadingButtonText: "Updating...",
            successMessage: "Currency updated successfully",
            onSuccessAction: "callback",
            cancelAction: "callback",
            fields: [
                {
                    name: "name",
                    label: "Currency Name",
                    type: "text",
                    placeholder: "e.g. US Dollar",
                    required: true,
                    defaultValue: "",
                    readOnly: false,
                    hidden: false
                },
                {
                    name: "code",
                    label: "Currency Code",
                    type: "text",
                    placeholder: "e.g. USD",
                    required: true,
                    defaultValue: "",
                    readOnly: true,
                    hidden: false
                },
                {
                    name: "symbol",
                    label: "Currency Symbol",
                    type: "text",
                    placeholder: "e.g. $",
                    required: true,
                    defaultValue: "",
                    readOnly: true,
                    hidden: false
                },
                {
                    name: "conversionRate",
                    label: "Conversion Rate",
                    type: "text",
                    placeholder: "e.g. 1.0",
                    required: true,
                    defaultValue: "",
                    readOnly: false,
                    hidden: false
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: "Active",
                    readOnly: false,
                    hidden: false,
                    options: [
                        { label: "Active", value: "Active" },
                        { label: "Inactive", value: "Inactive" }
                    ]
                }
            ]
        }
    }
};
