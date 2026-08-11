"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import LinkedCompanyCell from "../common/LinkedCompanyCell";
import { formatDate } from "@/lib/utils";

export default function UomSidePanel({ uomId, onClose }) {
    const router = useRouter();
    const [currentId, setCurrentId] = useState(uomId);
    const [uom, setUom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);

    useEffect(() => {
        if (uomId) {
            setCurrentId(uomId);
        }
    }, [uomId]);

    useEffect(() => {
        if (!currentId) return;
        fetchUom(currentId);
    }, [currentId]);

    const fetchUom = async (idToFetch) => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `uom-details/${idToFetch}`,
                    module: "uom",
                },
            });
            if (res.status === 403) {
                setErrorType("forbidden");
                return;
            }
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.uomId) {
                setUom(data);
            } else {
                setErrorType("not-found");
            }
        } catch (err) {
            console.error("Failed to load UOM details", err);
            setErrorType("not-found");
        } finally {
            setLoading(false);
        }
    };

    const sections = uom
        ? [
              {
                  title: "UOM Info",
                  rows: [
                      { label: "UOM Code", value: uom.uomCode || "-" },
                      { label: "UOM Name", value: uom.uomName || "-" },
                      { label: "Abbreviation", value: uom.abbreviation || "-" },
                      { label: "ISO Code", value: uom.isoCode || "-" },
                      {
                          label: "Company",
                          value: (
                              <LinkedCompanyCell
                                  companyId={uom.companyId}
                                  companyName={uom.companyName || uom.company?.companyName}
                              />
                          ),
                      },
                      { label: "Status", value: uom.status || "-" },
                  ],
              },
              {
                  title: "Audit",
                  rows: [
                      { label: "Added By", value: uom.addedByName || "-" },
                      { label: "Added Date", value: formatDate(uom.addedDate) },
                      { label: "Updated By", value: uom.updatedByName || "-" },
                      { label: "Updated Date", value: formatDate(uom.updatedDate) },
                  ],
              },
          ]
        : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={errorType}
            title="UOM Details"
            avatar={null}
            initials={uom?.uomCode?.substring(0, 2) || "UM"}
            name={uom?.uomName || ""}
            subtitle={uom?.uomCode || ""}
            status={uom?.status || ""}
            onMoreDetails={() => {
                onClose();
                router.push(`/uom/${currentId}`);
            }}
            moreDetailsId={currentId}
            sections={sections}
        />
    );
}
