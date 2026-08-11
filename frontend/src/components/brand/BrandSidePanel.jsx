"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import LinkedCompanyCell from "../common/LinkedCompanyCell";
import { formatDate } from "@/lib/utils";

export default function BrandSidePanel({ brandId, onClose }) {
    const router = useRouter();
    const [currentId, setCurrentId] = useState(brandId);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);

    useEffect(() => {
        if (brandId) {
            setCurrentId(brandId);
        }
    }, [brandId]);

    useEffect(() => {
        if (!currentId) return;
        fetchBrand(currentId);
    }, [currentId]);

    const fetchBrand = async (idToFetch) => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `brand-details/${idToFetch}`,
                    module: "brand",
                },
            });
            if (res.status === 403) {
                setErrorType("forbidden");
                return;
            }
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.brandId) {
                setBrand(data);
            } else {
                setErrorType("not-found");
            }
        } catch (err) {
            console.error("Failed to load brand details", err);
            setErrorType("not-found");
        } finally {
            setLoading(false);
        }
    };

    const sections = brand
        ? [
              {
                  title: "Brand Info",
                  rows: [
                      { label: "Brand Code", value: brand.brandCode || "-" },
                      { label: "Brand Name", value: brand.brandName || "-" },
                      {
                          label: "Company",
                          value: (
                              <LinkedCompanyCell
                                  companyId={brand.companyId}
                                  companyName={brand.companyName || brand.company?.companyName}
                              />
                          ),
                      },
                      { label: "Manufacturer", value: brand.manufacturerName || "-" },
                      { label: "Status", value: brand.status || "-" },
                  ],
              },
              {
                  title: "Audit",
                  rows: [
                      { label: "Added By", value: brand.addedByName || "-" },
                      { label: "Added Date", value: formatDate(brand.addedDate) },
                      { label: "Updated By", value: brand.updatedByName || "-" },
                      { label: "Updated Date", value: formatDate(brand.updatedDate) },
                  ],
              },
          ]
        : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={errorType}
            title="Brand Details"
            avatar={null}
            initials={brand?.brandCode?.substring(0, 2) || "BR"}
            name={brand?.brandName || ""}
            subtitle={brand?.brandCode || ""}
            status={brand?.status || ""}
            onMoreDetails={() => {
                onClose();
                router.push(`/brand/${currentId}`);
            }}
            moreDetailsId={currentId}
            sections={sections}
        />
    );
}
