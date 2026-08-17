import { ItemFormSchema, ItemUpdateSchema } from "../../Zod";

export const itemFormConfig = {
    contexts: {
        "item-add": {
            mode: "add",
            title: "Add Item",
            schema: ItemFormSchema,
            api: {
                method: "POST",
                endpoint: "item-add",
                module: "item",
            },
            submitButtonText: "Submit",
            loadingButtonText: "Creating...",
            successMessage: "Item created successfully",
        },
        "item-update": {
            mode: "update",
            title: "Edit Item",
            schema: ItemUpdateSchema,
            api: {
                fetchEndpoint: "item-details",
                method: "PUT",
                endpoint: "item-update",
                module: "item",
            },
            submitButtonText: "Update",
            loadingButtonText: "Updating...",
            successMessage: "Item updated successfully",
        },
    },
};
