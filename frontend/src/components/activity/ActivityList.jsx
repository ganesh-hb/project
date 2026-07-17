"use client";
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { activityColumns } from './columns';
import ActivityFilters from './ActivityFilters';
import { authHeaders } from '@/app/lib/auth';
import { decryptResponse } from '@/app/lib/crypto';
import { toast } from 'react-toastify';
import { LogIn, LogOut, UserCog, UserPlus, UserCheck, PlusSquare, Edit, FolderPlus, Activity, KeyRound } from 'lucide-react';

const getIcon = (code) => {
  switch (code) {
    case 'USER_LOGIN':
      return <LogIn className="h-4 w-4 text-green-600" />;
    case 'USER_LOGOUT':
      return <LogOut className="h-4 w-4 text-red-600" />;
    case 'USER_IMPERSONATION':
      return <UserCog className="h-4 w-4 text-purple-600" />;
    case 'USER_CREATE':
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    case 'USER_UPDATE':
      return <UserCheck className="h-4 w-4 text-teal-600" />;
    case 'USER_PASSWORD_CHANGE':
      return <KeyRound className="h-4 w-4 text-orange-600" />;
    case 'COMPANY_CREATE':
      return <PlusSquare className="h-4 w-4 text-sky-600" />;
    case 'COMPANY_UPDATE':
      return <Edit className="h-4 w-4 text-indigo-600" />;
    case 'GROUP_CREATE':
      return <FolderPlus className="h-4 w-4 text-yellow-600" />;
    case 'GROUP_UPDATE':
      return <Edit className="h-4 w-4 text-amber-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export default function ActivityList() {
  const LIMIT = 10;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // default to list view (timeline)
  const [filters, setFilters] = useState({});

  const fetchData = async (page = 1, customFilters = filters, append = false) => {
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
      const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;

      const newActs = data?.data ?? [];
      setActivities((prev) => {
        const existingIds = new Set(prev.map(a => a.logId || a.id));
        const filteredActs = newActs.filter(a => !existingIds.has(a.logId || a.id));
        return append ? [...prev, ...filteredActs] : newActs;
      });
      setTotalPages(Math.ceil((data?.total || 1) / LIMIT));
      setCurrentPage(page);
    } catch (err) {
      toast.error(`${err}`, { position: 'top-right' });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, {}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (currentPage >= totalPages) return;
    fetchData(currentPage + 1, filters, true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(1, newFilters, false);
  };

  const severityColor = (severity) => {
    if (severity === 'HIGH') return 'bg-red-100 text-red-700';
    if (severity === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
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
            {["list", "grid", "table"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition cursor-pointer rounded-xl ${viewMode === mode ? 'bg-[#1d6fdc] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {mode === "list" ? "Timeline" : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-red-600 font-semibold mb-4">{error}</div>
        )}

        {/* Timeline View (list view mode) */}
        {!error && viewMode === 'list' && (
          <div className="relative pl-8 border-l border-gray-200 ml-4 space-y-6">
            {activities.map((a) => (
              <div key={a.id || a.logId} className="relative">
                <span className="absolute -left-[48px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
                  {getIcon(a.actionCode || a.activityCode)}
                </span>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {a.actionName || a.activityName || 'Activity'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {a.generatedMessage}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                        {a.actorName && (
                          <span>Actor: <span className="text-gray-600">{a.actorName}</span></span>
                        )}
                        {a.targetType && (
                          <span>Target: <span className="text-gray-600">{a.targetType} #{a.targetId}</span></span>
                        )}
                        {a.companyName && (
                          <span>Company: <span className="text-gray-600">{a.companyName}</span></span>
                        )}
                        <span>Status: <span className={`font-medium ${a.executionStatus === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>{a.executionStatus}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityColor(a.severity)}`}>
                        {a.severity}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && !loading && (
              <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200 -ml-8">
                No activity records found.
              </div>
            )}
          </div>
        )}

        {/* Grid View */}
        {!error && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activities.map((a) => (
              <div key={a.id || a.logId} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                    {(a.actionCode || a.activityCode)?.charAt(0) ?? 'A'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{a.actionName || a.activityName}</h3>
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
            {activities.length === 0 && !loading && (
              <div className="col-span-full text-center text-gray-400 py-20 bg-white rounded-xl border border-gray-200">
                No activity records found.
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {!error && viewMode === 'table' && (
          <DataTable columns={activityColumns} data={activities} />
        )}

        {loading && (
          <div className="text-center py-8 text-gray-500 font-medium">
            Loading older activities...
          </div>
        )}

        {/* Lazy Loading load-more triggers for List and Grid view */}
        {!loading && currentPage < totalPages && viewMode !== 'table' && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 cursor-pointer"
            >
              Show older activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
