"use client";
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { activityColumns } from './columns';
import Header from '@/components/Header';
import ActivityFilters from './ActivityFilters';
import AppPagination from '@/components/ui/AppPagination';
import { authHeaders } from '@/app/lib/auth';
import { toast } from 'react-toastify';

export default function ActivityList() {
  const LIMIT = 10;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table
  const [filters, setFilters] = useState({});

  const fetchData = async (page = currentPage, customFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const body = { page, limit: LIMIT, ...customFilters };
      const response = await fetch('/relayapi', {
        method: 'POST',
        headers: { ...authHeaders(), endpoint: 'list', module: 'activity' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        toast.error('Failed to fetch activity logs', { position: 'top-right' });
      }
      const payload = await response.json();
      const data = payload.encrypted ? JSON.parse(atob(payload.encrypted)) : payload;

      setActivities(data?.data ?? []);
      setTotalPages(Math.ceil((data?.total || 1) / LIMIT));
    } catch (err) {
      toast.error(`${err}`, { position: 'top-right' });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, {});
  }, []);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchData(page);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchData(1, newFilters);
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] overflow-x-hidden">
      <ActivityFilters onFilterChange={handleFilterChange} />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
          <span className="cursor-pointer transition-colors hover:text-blue-600 hover:underline" onClick={() => (window.location.href = '/')}>Home</span>
          <span className="text-gray-400">{'>'}</span>
          <span className="text-gray-800">Activity Log</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1f2937]">Activity Log</h1>
          <div className="flex gap-2">
            {["grid", "list", "table"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition cursor-pointer ${viewMode === mode ? 'bg-[#1d6fdc] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-xl font-semibold text-gray-500">Loading activity logs...</div>
        )}
        {error && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-red-600 font-semibold">{error}</div>
        )}

        {!loading && !error && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activities.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                    {a.actionCode?.charAt(0) ?? 'A'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{a.actionName}</h3>
                    <p className="text-sm text-gray-500">{a.actorName}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Target:</span> {a.targetType} ({a.targetId})</p>
                  <p><span className="font-medium">Company:</span> {a.companyName || '-'}</p>
                  <p><span className="font-medium">Status:</span> {a.executionStatus}</p>
                  <p><span className="font-medium">Time:</span> {new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-20 bg-white rounded-xl border border-gray-200">
                No activity records found.
              </div>
            )}
          </div>
        )}

        {!loading && !error && viewMode === 'list' && (
          <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-[#f3f4f6] border-b border-gray-200">
                  <tr className="text-[#6b7280] text-sm font-semibold">
                    <th className="px-5 py-4 text-left">Action</th>
                    <th className="px-5 py-4 text-left">Actor</th>
                    <th className="px-5 py-4 text-left">Company</th>
                    <th className="px-5 py-4 text-left">Target</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Time</th>
                    <th className="px-5 py-4 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-[#3563e9]">{a.actionCode}</td>
                      <td className="px-5 py-4">{a.actorName}</td>
                      <td className="px-5 py-4">{a.companyName || '-'}</td>
                      <td className="px-5 py-4">{a.targetType} ({a.targetId})</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${{
                            SUCCESS: 'bg-green-100 text-green-700',
                            FAILURE: 'bg-red-100 text-red-700',
                            PENDING: 'bg-yellow-100 text-yellow-700',
                          }[a.executionStatus]}`}
                        >
                          {a.executionStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <button
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => alert(JSON.stringify(a.parameters, null, 2))}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-400 py-16">No activity records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && viewMode === 'table' && (
          <DataTable columns={activityColumns} data={activities} />
        )}

        <div className="fixed bottom-0 right-0 p-4">
          <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
