"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { loginContext } from "./hooks/LoginContext";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authHeaders } from "@/app/lib/auth";

export default function Header({ onSearch, page }) {
    const router = useRouter();
    const { isLogin, setLogin } = useContext(loginContext);

    // console.log(isLogin, "################################ is login header")

    const formattedGroupName =
        isLogin?.assignments?.length
            ? [...new Set(
                isLogin.assignments
                    .map(a => a.groupName)
                    .filter(Boolean)
            )]
                .map(name => name.replace(/([A-Z])/g, ' $1').trim())
                .join(', ')
            : 'N/A';

    const formattedCompanyName =
        isLogin?.assignments?.length
            ? [...new Set(
                isLogin.assignments
                    .map(a => a.companyName)
                    .filter(Boolean)
            )].join(', ')
            : 'N/A';


    const [openProfile, setOpenProfile] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showSearchPopup, setShowSearchPopup] = useState(false);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [filterCondition, setFilterCondition] = useState("All");
    const [position, setPosition] = React.useState("grid")

    const [filterRows, setFilterRows] = useState([
        {
            field: "name",
            operator: "equal",
            value: ""
        }
    ]);

    const [sidePanelFilters, setSidePanelFilters] = useState({
        name: "",
        email: "",
        groupName: "",
        companyName: "",
        status: ""
    });

    const profileRef = useRef(null);
    const searchPopupRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        async function Page() {
            const loggedIn = document.cookie
                .split("; ")
                .find(row => row.startsWith("loggedIn="))
                ?.split("=")[1];

            if (!loggedIn) return;

            const allData = await fetch(`http://localhost:3000/relayapi`, {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `user-details/${loggedIn}`,
                    module: "user"
                },
            });

            const res = await allData.json();
            setLogin(res);
        }

        Page();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setOpenProfile(false);
            }

            if (
                searchPopupRef.current &&
                !searchPopupRef.current.contains(event.target)
            ) {
                setShowSearchPopup(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    let image = `http://localhost:4000/upload/${isLogin?.userId}/${isLogin?.userFile}`;

    const gotoLogout = (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.cookie =
            document.cookie = "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        document.cookie =
            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

        router.refresh();
    };

    const gotoChangePass = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push("http://localhost:3000/reset-pass");
    };

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

    const handleEnterSearch = (e) => {
        if (e.key === "Enter") {
            if (onSearch) {
                let filters = [];

                if (searchValue.trim() !== "") {
                    filters.push({
                        key: "name",
                        operator: "equal",
                        value: searchValue
                    });
                }

                onSearch({
                    filters: filters,
                    condition: "All"
                });
            }
        }
    };

    const addFilterRow = () => {
        let temp = [...filterRows];

        temp.push({
            field: "name",
            operator: "equal",
            value: ""
        });

        setFilterRows(temp);
    };

    const removeFilterRow = (index) => {
        let temp = [];

        for (let i = 0; i < filterRows.length; i++) {
            if (i !== index) {
                temp.push(filterRows[i]);
            }
        }
        setFilterRows(temp);
    };

    const updateFilterRow = (index, key, value) => {
        let temp = [...filterRows];

        temp[index][key] = value;

        setFilterRows(temp);
    };

    const handleFind = () => {
        let filters = [];

        for (let i = 0; i < filterRows.length; i++) {
            if (filterRows[i].value.trim() !== "") {
                filters.push({
                    key: filterRows[i].field,
                    operator: filterRows[i].operator,
                    value: filterRows[i].value
                });
            }
        }

        if (onSearch) {
            onSearch({
                filters: filters,
                condition: filterCondition
            });
        }

        setShowSearchPopup(false);
    };

    const handlePopupReset = () => {
        setFilterRows([
            {
                field: "name",
                operator: "equal",
                value: ""
            }
        ]);

        setFilterCondition("All");

        if (onSearch) {
            onSearch({
                filters: [],
                condition: "All"
            });
        }
    };

    const handleSidePanelFilter = (key, value) => {
        let temp = { ...sidePanelFilters };

        temp[key] = value;

        setSidePanelFilters(temp);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            let filters = [];

            for (let item in temp) {
                if (temp[item].trim() !== "") {
                    filters.push({
                        key: item,
                        operator: "contains",
                        value: temp[item]
                    });
                }
            }

            if (onSearch) {
                onSearch({
                    filters: filters,
                    condition: "All"
                });
            }
        }, 400);
    };

    const handleSidePanelReset = () => {
        setSidePanelFilters({
            name: "",
            email: "",
            groupName: "",
            companyName: "",
            status: ""
        });

        if (onSearch) {
            onSearch({
                filters: [],
                condition: "All"
            });
        }
    };

    const gotoSitemap = () => {
        router.push('/')
    }

    return (
        <>
            <header className="h-[72px] w-full border-b border-gray-200 bg-white px-6 flex items-center justify-between relative z-40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg bg-blue-100 flex items-center justify-center cursor-pointer" onClick={(e) => {
                            gotoSitemap(e)
                        }}>
                            <span className="text-blue-600 font-bold text-xl">
                                R
                            </span>
                        </div>

                        <div className="leading-tight">
                            <h1 className="text-2xl font-bold text-gray-800"></h1>
                        </div>
                    </div>

                    {page === "users" && (
                        <div className="flex h-12 w-[520px] items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            <div className="px-4 text-gray-500 text-lg">
                                ⌕
                            </div>

                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={handleSearch}
                                onKeyDown={handleEnterSearch}
                                className="flex-1 bg-transparent px-2 text-sm outline-none text-black"
                            />

                            <select className="h-full border-l border-gray-200 bg-transparent px-4 text-sm text-gray-600 outline-none">
                                <option>Name</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-5">
                    {page === "users" && <div className="flex items-center gap-4 text-gray-500">
                        <div
                            className="relative"
                            ref={searchPopupRef}
                        >
                            <button
                                className="text-lg hover:text-blue-600"
                                onClick={() =>
                                    setShowSearchPopup(!showSearchPopup)
                                }
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                </svg>
                            </button>

                            {showSearchPopup && (
                                <div className="absolute right-0 top-10 z-50 w-[520px] bg-white border border-gray-200 rounded-xl shadow-2xl p-4">
                                    <button
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                        onClick={() =>
                                            setShowSearchPopup(false)
                                        }
                                    >
                                        ✕
                                    </button>

                                    <div className="flex items-center gap-2 mb-3">
                                        <select
                                            value={filterCondition}
                                            onChange={(e) =>
                                                setFilterCondition(e.target.value)
                                            }
                                            className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 outline-none"
                                        >
                                            <option value="All">
                                                All
                                            </option>

                                            <option value="Any">
                                                Any
                                            </option>
                                        </select>

                                        <button
                                            onClick={addFilterRow}
                                            className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center text-lg font-bold hover:bg-blue-700"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 mb-4">
                                        {filterRows.map((row, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <select
                                                    value={row.field}
                                                    onChange={(e) =>
                                                        updateFilterRow(
                                                            index,
                                                            "field",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 outline-none flex-1"
                                                >
                                                    <option value="name">
                                                        Name
                                                    </option>

                                                    <option value="email">
                                                        Email
                                                    </option>

                                                    <option value="phone">
                                                        Phone
                                                    </option>

                                                    <option value="groupName">
                                                        Group Name
                                                    </option>

                                                    <option value="status">
                                                        Status
                                                    </option>
                                                </select>

                                                <select
                                                    value={row.operator}
                                                    onChange={(e) =>
                                                        updateFilterRow(
                                                            index,
                                                            "operator",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border border-gray-200 rounded px-2 py-1.5 text-sm text-black outline-none flex-1"
                                                >
                                                    <option value="equal" className="text-black">
                                                        Equal
                                                    </option>

                                                    <option value="contains">
                                                        Contains
                                                    </option>

                                                    <option value="begin">
                                                        Begins With
                                                    </option>

                                                    <option value="end">
                                                        Ends With
                                                    </option>
                                                </select>

                                                <input
                                                    type="text"
                                                    value={row.value}
                                                    onChange={(e) =>
                                                        updateFilterRow(
                                                            index,
                                                            "value",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Value"
                                                    className="border border-gray-200 rounded px-2 py-1.5 text-sm outline-none flex-[1.5] text-black"
                                                />

                                                <button
                                                    onClick={() =>
                                                        removeFilterRow(index)
                                                    }
                                                    className="w-7 h-7 bg-gray-200 text-gray-600 rounded flex items-center justify-center hover:bg-red-100 hover:text-red-500"
                                                >
                                                    −
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={handlePopupReset}
                                            className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>

                                        <button
                                            onClick={handleFind}
                                            className="bg-blue-600 text-white px-6 py-1.5 rounded text-sm hover:bg-blue-700"
                                        >
                                            Find
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="text-lg hover:text-blue-600">
                            ↻
                        </button>

                        <button className="text-lg hover:text-blue-600">
                            ⇪
                        </button>

                        <button
                            className={`text-lg hover:text-blue-600 ${showSidePanel ? "text-blue-600" : ""}`}
                            onClick={() =>
                                setShowSidePanel(!showSidePanel)
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                            </svg>
                        </button>

                        <div className="mt-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div variant="outline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm8.5 0v8H15V2zm0 9v3H15v-3zm-1-9H1v3h6.5zM1 14h6.5V6H1z" />
                                    </svg></div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-32">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>View Preference</DropdownMenuLabel>
                                        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                                            <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="table">Table</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>}

                    <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
                        <img
                            src="https://flagcdn.com/us.svg"
                            alt="flag"
                            className="h-4 w-6 rounded-sm object-cover"
                        />

                        <span className="text-sm text-gray-700">
                            English
                        </span>

                        <span className="text-xs text-gray-500">
                            ▼
                        </span>
                    </div>

                    <button className="text-gray-500 hover:text-blue-600">
                        <img src="/header/menu.svg" alt="" />

                    </button>

                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setOpenProfile(!openProfile)}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 hover:bg-gray-100"
                        >
                            <img
                                src={
                                    !isLogin?.userFile
                                        ? "https://i.pravatar.cc/150?img=12"
                                        : image
                                }
                                alt="profile"
                                className="h-10 w-10 rounded-full object-cover"
                            />

                            <div className="leading-tight">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {isLogin?.name || "guest"}
                                </h4>

                                <p className="text-xs text-gray-500">
                                    {formattedGroupName || "N/A"}{" "}|{" "}
                                    {formattedCompanyName || "N/A"}
                                </p>
                            </div>

                            <span className="text-xs text-gray-500">
                                {openProfile ? "▲" : "▼"}
                            </span>
                        </div>

                        {openProfile && (
                            <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                                <button className="flex w-full items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b">
                                    <span className="text-sm font-medium text-gray-700">
                                        Profile
                                    </span>
                                </button>

                                <button className="flex w-full items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b">
                                    <span className="text-sm font-medium text-gray-700">
                                        Preferences
                                    </span>
                                </button>

                                <button className="flex w-full items-center gap-4 px-5 py-4 hover:bg-gray-50 border-b">
                                    <span
                                        className="text-sm font-medium text-gray-700"
                                        onClick={(e) => {
                                            gotoChangePass(e);
                                        }}
                                    >
                                        Change Password
                                    </span>
                                </button>

                                <button className="flex w-full items-center gap-4 px-5 py-4 hover:bg-red-50">
                                    <span
                                        className="text-sm font-medium text-red-500 cursor-pointer"
                                        onClick={(e) => gotoLogout(e)}
                                    >
                                        Logout
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                        ☰
                        <span>Menu</span>
                    </button>
                </div>
            </header>

            {showSidePanel && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowSidePanel(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-[300px] bg-white border-l border-gray-200 shadow-2xl z-40 transition-transform duration-300 ${showSidePanel ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between px-5 py-4 bg-blue-600">
                    <h2 className="text-white font-semibold text-base">
                        Filters
                    </h2>

                    <button
                        onClick={() => setShowSidePanel(false)}
                        className="text-white hover:text-blue-200 text-xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5 overflow-y-auto h-[calc(100%-64px)]">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>

                        <input
                            type="text"
                            value={sidePanelFilters.name}
                            onChange={(e) =>
                                handleSidePanelFilter(
                                    "name",
                                    e.target.value
                                )
                            }
                            placeholder="Please enter Name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>

                        <input
                            type="text"
                            value={sidePanelFilters.email}
                            onChange={(e) =>
                                handleSidePanelFilter(
                                    "email",
                                    e.target.value
                                )
                            }
                            placeholder="Please enter Email"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group Name
                        </label>

                        <input
                            type="text"
                            value={sidePanelFilters.groupName}
                            onChange={(e) =>
                                handleSidePanelFilter(
                                    "groupName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter Group Name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>

                        <input
                            type="text"
                            value={sidePanelFilters.companyName}
                            onChange={(e) =>
                                handleSidePanelFilter(
                                    "companyName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter Company Name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>

                        <select
                            value={sidePanelFilters.status}
                            onChange={(e) =>
                                handleSidePanelFilter(
                                    "status",
                                    e.target.value
                                )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-600"
                        >
                            <option value="">
                                Select Status
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Inactive">
                                Inactive
                            </option>
                        </select>
                    </div>

                    <button
                        onClick={handleSidePanelReset}
                        className="mt-2 w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </>
    );
}