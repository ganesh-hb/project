"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import { formatDate } from "@/lib/utils";

export default function ItemCategorySidePanel({ itemCategoryId, onClose }) {
    const router = useRouter();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);

    useEffect(() => {
        if (!itemCategoryId) return;
        fetchCategory();
    }, [itemCategoryId]);

    const fetchCategory = async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `item-category-details/${itemCategoryId}`,
                    module: "item-category",
                },
            });
            if (res.status === 403) {
                setErrorType("forbidden");
                return;
            }
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.itemCategoryId) {
                setCategory(data);
            } else {
                setErrorType("not-found");
            }
        } catch (err) {
            console.error(err);
            setErrorType("not-found");
        } finally {
            setLoading(false);
        }
    };

    const sections = category
        ? [
              {
                  title: "Category Info",
                  rows: [
                      { label: "Category Code", value: category.itemCategoryCode || "-" },
                      { label: "Category Name", value: category.itemCategoryName || "-" },
                      { label: "Type", value: category.type || "-" },
                  ],
              },
              {
                  title: "Audit",
                  rows: [
                      { label: "Added By", value: category.addedByName || "-" },
                      { label: "Added Date", value: formatDate(category.addedDate) },
                      { label: "Updated By", value: category.updatedByName || "-" },
                      { label: "Updated Date", value: formatDate(category.updatedDate) },
                  ],
              },
          ]
        : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={errorType}
            title="Item Category Details"
            avatar={null}
            initials={category?.itemCategoryCode?.substring(0, 2) || "IC"}
            name={category?.itemCategoryName || ""}
            subtitle={category?.itemCategoryCode || ""}
            status={category?.status || ""}
            onMoreDetails={() => {
                onClose();
                router.push(`/item-category/${itemCategoryId}`);
            }}
            moreDetailsId={itemCategoryId}
            sections={sections}
        />
    );
}
