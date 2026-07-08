"use client";
import { useRouter } from "next/navigation";
import Header from "./Header";

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <>
            <div className="min-h-screen flex flex-col bg-[#f5f6f8]">
                <Header page="forbidden" />

                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-12 shadow-xl border border-gray-100 text-center">
                        <div className="mb-4 text-9xl font-black text-gray-200 select-none">
                            403
                        </div>

                        <h1 className="mb-4 text-4xl font-bold text-gray-800">
                            Access Denied
                        </h1>

                        <p className="mx-auto mb-10 max-w-lg text-lg leading-8 text-gray-500">
                            You don't have permission to view this page. Contact
                            your administrator if you think this is a mistake.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="rounded-xl bg-gray-200 px-7 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                            >
                                ← Go Back
                            </button>

                            <button
                                onClick={() => router.push("/")}
                                className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
                            >
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}