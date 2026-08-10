"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import { formatDate } from "@/lib/utils";

export default function PackageSidePanel({ packageId, onClose }) {
    const router = useRouter();
    const [currentId, setCurrentId] = useState(packageId);
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);

    useEffect(() => {
        if (packageId) {
            setCurrentId(packageId);
        }
    }, [packageId]);

    useEffect(() => {
        if (!currentId) return;
        fetchPackage(currentId);
    }, [currentId]);

    const fetchPackage = async (idToFetch) => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `package-details/${idToFetch}`,
                    module: "package",
                },
            });
            if (res.status === 403) {
                setErrorType("forbidden");
                return;
            }
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.packageId) {
                setPkg(data);
            } else {
                setErrorType("not-found");
            }
        } catch (err) {
            console.error("Failed to load package details", err);
            setErrorType("not-found");
        } finally {
            setLoading(false);
        }
    };

    const sections = pkg
        ? [
              {
                  title: "Package Info",
                  rows: [
                      { label: "Package Code", value: pkg.packageCode || "-" },
                      { label: "Package Name", value: pkg.packageName || "-" },
                      { label: "Description", value: pkg.description || "-" },
                      { label: "Company", value: pkg.companyName || pkg.company?.companyName || "-" },
                      { label: "Status", value: pkg.status || "-" },
                  ],
              },
              {
                  title: "Audit",
                  rows: [
                      { label: "Added By", value: pkg.addedByName || "-" },
                      { label: "Added Date", value: formatDate(pkg.addedDate) },
                      { label: "Updated By", value: pkg.updatedByName || "-" },
                      { label: "Updated Date", value: formatDate(pkg.updatedDate) },
                  ],
              },
          ]
        : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={errorType}
            title="Package Details"
            avatar={null}
            initials={pkg?.packageCode?.substring(0, 2) || "PK"}
            name={pkg?.packageName || ""}
            subtitle={pkg?.packageCode || ""}
            status={pkg?.status || ""}
            onMoreDetails={() => {
                onClose();
                router.push(`/package/${currentId}`);
            }}
            moreDetailsId={currentId}
            sections={sections}
        />
    );
}
