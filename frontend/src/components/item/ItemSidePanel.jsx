"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import LinkedCompanyCell from "../common/LinkedCompanyCell";
import { formatDate, getImageUrl } from "@/lib/utils";

export default function ItemSidePanel({ itemId, onClose }) {
    const router = useRouter();
    const [currentId, setCurrentId] = useState(itemId);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);

    useEffect(() => {
        if (itemId) setCurrentId(itemId);
    }, [itemId]);

    useEffect(() => {
        if (!currentId) return;
        fetchItem(currentId);
    }, [currentId]);

    const fetchItem = async (idToFetch) => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `item-details/${idToFetch}`,
                    module: "item",
                },
            });
            if (res.status === 403) { setErrorType("forbidden"); return; }
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.itemId) {
                setItem(data);
            } else {
                setErrorType("not-found");
            }
        } catch {
            setErrorType("not-found");
        } finally {
            setLoading(false);
        }
    };

    const sections = item ? [
        {
            title: "Item Info",
            rows: [
                { label: "Item Code", value: item.itemCode || "-" },
                { label: "Barcode", value: item.barcode || "-" },
                { label: "Item Name", value: item.itemName || "-" },
                { label: "Short Name", value: item.shortName || "-" },
                { label: "Category", value: item.categoryName || "-" },
                { label: "Manufacturer", value: item.manufacturerName || "-" },
                { label: "Brand", value: item.brandName || "-" },
                {
                    label: "Company",
                    value: (
                        <LinkedCompanyCell
                            companyId={item.companyId}
                            companyName={item.companyName || item.company?.companyName}
                        />
                    ),
                },
                { label: "Status", value: item.status || "-" },
            ],
        },
        {
            title: "Quantity & Pricing",
            rows: [
                { label: "Primitive Qty", value: item.primitiveQuantity ?? "-" },
                { label: "Item UOM", value: item.itemUomName || "-" },
                { label: "Package Type", value: item.packageName || "-" },
                { label: "Purchase Price", value: item.purchasePrice != null ? `${item.currencySymbol || ""} ${item.purchasePrice}`.trim() : "-" },
                { label: "Cost Per Unit", value: item.costPerUnit != null ? `${item.currencySymbol || ""} ${item.costPerUnit}`.trim() : "-" },
                { label: "Currency", value: item.currencyName ? `${item.currencyName} (${item.currencyCode})` : "-" },
                { label: "Conversion Rate", value: item.conversionRate ?? "-" },
                { label: "Decimal Allowed", value: item.isDecimalAllowed === "true" ? "Yes" : "No" },
            ],
        },
        {
            title: "Shelf Life",
            rows: [
                { label: "Check Shelf Life", value: item.checkShelfLife === "true" ? "Yes" : "No" },
                { label: "Shelf Life Unit", value: item.shelfLifeUnit || "-" },
                { label: "Shelf Life Span", value: item.shelfLifeSpan ?? "-" },
            ],
        },
        {
            title: "Other",
            rows: [
                { label: "Remarks", value: item.remarks || "-" },
                { label: "Archive", value: item.archive === "true" ? "Yes" : "No" },
            ],
        },
        {
            title: "Audit",
            rows: [
                { label: "Added By", value: item.addedByName || "-" },
                { label: "Added Date", value: formatDate(item.addedDate) },
                { label: "Updated By", value: item.updatedByName || "-" },
                { label: "Updated Date", value: formatDate(item.updatedDate) },
            ],
        },
    ] : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={errorType}
            title="Item Details"
            avatar={getImageUrl(item?.primaryImage) || null}
            initials={(item?.itemCode || "IT").substring(0, 2).toUpperCase()}
            name={item?.itemName || ""}
            subtitle={item?.itemCode || ""}
            status={item?.status || ""}
            onMoreDetails={() => {
                onClose();
                router.push(`/item/${currentId}`);
            }}
            moreDetailsId={currentId}
            sections={sections}
        />
    );
}
