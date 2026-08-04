"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import SidePanel from "../common/SidePanel";
import { formatDate } from "@/lib/utils";

export default function CurrencySidePanel({ currencyId, onClose, onMoreDetails }) {
    const [currency, setCurrency] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currencyId) return;
        fetchCurrency();
    }, [currencyId]);

    const fetchCurrency = async () => {
        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `currency-details/${currencyId}`,
                    module: "currency",
                },
            });
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            setCurrency(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sections = currency
        ? [
              {
                  title: "Basic Info",
                  rows: [
                      { label: "Currency Code", value: currency.code || "-" },
                      { label: "Currency Symbol", value: currency.symbol || "-" },
                      { label: "Base Currency", value: currency.baseCurrency || "-" },
                  ],
              },
              {
                  title: "Conversion",
                  rows: [
                      { label: "Conversion Rate", value: currency.conversionRate ?? "-" },
                      { label: "Last Synced Date", value: formatDate(currency.lastSync) },
                  ],
              },
              {
                  title: "Audit",
                  rows: [
                      { label: "Added By", value: currency.addedByName || "-" },
                      { label: "Added Date", value: formatDate(currency.addedDate) },
                      { label: "Updated By", value: currency.updatedByName || "-" },
                      { label: "Updated Date", value: formatDate(currency.updatedDate) },
                  ],
              },
          ]
        : [];

    return (
        <SidePanel
            onClose={onClose}
            loading={loading}
            errorType={!currency && !loading ? "not-found" : null}
            title="Currency Details"
            avatar={null}
            initials={currency?.symbol || "$"}
            name={currency?.name || ""}
            subtitle={currency?.code || ""}
            status={currency?.status || ""}
            onMoreDetails={onMoreDetails}
            moreDetailsId={currencyId}
            sections={sections}
        />
    );
}
