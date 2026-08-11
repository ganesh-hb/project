"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import LinkedCompanyCell from "../common/LinkedCompanyCell";
import { formatDate } from "@/lib/utils";
import { loginContext } from "../hooks/LoginContext";

export default function ManufacturerSidePanel({ manufacturerId, onClose }) {
    const router = useRouter();
    const { can } = useContext(loginContext);
    const [currentId, setCurrentId] = useState(manufacturerId);
    const [manufacturer, setManufacturer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);

    useEffect(() => {
        if (manufacturerId) {
            setCurrentId(manufacturerId);
        }
    }, [manufacturerId]);

    useEffect(() => {
        if (!currentId) return;
        fetchManufacturer(currentId);
    }, [currentId]);

    const fetchManufacturer = async (idToFetch) => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `manufacturer-details/${idToFetch}`,
                    module: "manufacturer",
                },
            });
            if (res.status === 403) {
                setErrorType("forbidden");
                return;
            }
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (data?.manufacturerId) {
                setManufacturer(data);
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

    const sections = manufacturer
        ? [
              {
                  title: "Manufacturer Info",
                  rows: [
                      { label: "Manufacturer Code", value: manufacturer.manufacturerCode || "-" },
                      { label: "Manufacturer Name", value: manufacturer.manufacturerName || "-" },
                      {
                          label: "Company",
                          value: (
                              <LinkedCompanyCell
                                  companyId={manufacturer.companyId}
                                  companyName={manufacturer.companyName || manufacturer.company?.companyName}
                              />
                          ),
                      },
                      { label: "Status", value: manufacturer.status || "-" },
                  ],
              },
              {
                  title: "Audit",
                  rows: [
                      { label: "Added By", value: manufacturer.addedByName || "-" },
                      { label: "Added Date", value: formatDate(manufacturer.addedDate) },
                      { label: "Updated By", value: manufacturer.updatedByName || "-" },
                      { label: "Updated Date", value: formatDate(manufacturer.updatedDate) },
                  ],
              },
          ]
        : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={errorType}
            title="Manufacturer Details"
            avatar={null}
            initials={manufacturer?.manufacturerCode?.substring(0, 2) || "MF"}
            name={manufacturer?.manufacturerName || ""}
            subtitle={manufacturer?.manufacturerCode || ""}
            status={manufacturer?.status || ""}
            onMoreDetails={() => {
                onClose();
                router.push(`/manufacturer/${currentId}`);
            }}
            moreDetailsId={currentId}
            sections={sections}
        />
    );
}
