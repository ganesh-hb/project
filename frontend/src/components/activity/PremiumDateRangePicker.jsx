"use client";
import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, startOfDay, endOfDay, subDays, addDays, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

export default function PremiumDateRangePicker({ startDate, endDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState([
        {
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            key: "selection",
        }
    ]);
    const [activeRange, setActiveRange] = useState("custom");
    const containerRef = useRef(null);

    useEffect(() => {
        if (startDate && endDate) {
            setState([
                {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    key: "selection",
                }
            ]);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDateDisplay = (date) => {
        if (!date) return "";
        return format(date, "dd/MM/yyyy");
    };

    const handleQuickSelect = (type) => {
        if (type === "custom") {
            setActiveRange("custom");
            return;
        }

        setActiveRange(type);
        const today = new Date();
        let start = today;
        let end = today;

        switch (type) {
            case "today":
                start = startOfDay(today);
                end = endOfDay(today);
                break;
            case "yesterday":
                start = startOfDay(subDays(today, 1));
                end = endOfDay(subDays(today, 1));
                break;
            case "last7":
                start = startOfDay(subDays(today, 6));
                end = endOfDay(today);
                break;
            // case "next7":
            //     start = startOfDay(today);
            //     end = endOfDay(addDays(today, 6));
            //     break;
            case "last30":
                start = startOfDay(subDays(today, 29));
                end = endOfDay(today);
                break;
            // case "next30":
            //     start = startOfDay(today);
            //     end = endOfDay(addDays(today, 29));
            //     break;
            case "thisMonth":
                start = startOfMonth(today);
                end = endOfMonth(today);
                break;
            case "lastMonth":
                start = startOfMonth(subMonths(today, 1));
                end = endOfMonth(subMonths(today, 1));
                break;
            // case "nextMonth":
            //     start = startOfMonth(addMonths(today, 1));
            //     end = endOfMonth(addMonths(today, 1));
            //     break;
            default:
                break;
        }

        setState([{ startDate: start, endDate: end, key: "selection" }]);
    };

    const handleApply = () => {
        onChange(state[0].startDate, state[0].endDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        if (startDate && endDate) {
            setState([
                {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    key: "selection",
                }
            ]);
        }
        setIsOpen(false);
        setActiveRange("custom");
    };

    const rangeText = startDate && endDate
        ? `${formatDateDisplay(new Date(startDate))} – ${formatDateDisplay(new Date(endDate))}`
        : "Select Date Range";

    const quickSelectButtons = [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 Days", value: "last7" },
        // { label: "Next 7 Days", value: "next7" },
        { label: "Last 30 Days", value: "last30" },
        // { label: "Next 30 Days", value: "next30" },
        { label: "This Month", value: "thisMonth" },
        { label: "Last Month", value: "lastMonth" },
        // { label: "Next Month", value: "nextMonth" },
        { label: "Custom Range", value: "custom" },
    ];

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 w-72 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 cursor-pointer"
            >
                <span className="truncate">{rangeText}</span>
                <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute left-0 z-50 mt-2 flex flex-row rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl w-max gap-4 scale-85 origin-top-left animate-in fade-in slide-in-from-top-1 duration-200">
                    <style>{`
                        .rdrMonths {
                            display: flex !important;
                            flex-direction: row !important;
                            flex-wrap: nowrap !important;
                        }
                    `}</style>
                    <div className="flex flex-col gap-4 shrink-0 w-[650px]">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={formatDateDisplay(state[0].startDate)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-center outline-none"
                                />
                                <span className="absolute right-3 top-2.5">📅</span>
                            </div>
                            <span className="text-gray-400">—</span>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={formatDateDisplay(state[0].endDate)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-center outline-none"
                                />
                                <span className="absolute right-3 top-2.5">📅</span>
                            </div>
                        </div>

                        <div className="premium-calendar-wrapper">
                            <DateRange
                                ranges={state}
                                onChange={(item) => {
                                    setState([item.selection]);
                                    setActiveRange("custom");
                                }}
                                months={2}
                                direction="horizontal"
                                showDateDisplay={false}
                                rangeColors={["#1d6fdc"]}
                                maxDate={new Date()}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-l border-gray-100 pl-4 w-52 shrink-0 justify-between">
                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[300px]">
                            {quickSelectButtons.map((btn) => (
                                <button
                                    key={btn.value}
                                    type="button"
                                    onClick={() => handleQuickSelect(btn.value)}
                                    className={`w-full text-left rounded-lg py-2 px-3 text-sm font-medium transition cursor-pointer shadow-sm ${activeRange === btn.value
                                        ? "bg-[#1d6fdc] text-white hover:bg-[#1a5ebc]"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleApply}
                                className="flex-1 rounded-lg border border-[#1d6fdc] bg-white text-[#1d6fdc] hover:bg-blue-50 py-2 text-sm font-semibold transition cursor-pointer"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 py-2 text-sm font-semibold transition cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
