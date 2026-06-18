export default function SiteMapHeader() {
    return (
        <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    ROCKEYE Production
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    B
                </div>

                <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100">
                    Menu
                </button>
            </div>
        </header>
    )

}