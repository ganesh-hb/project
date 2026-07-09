"use client";
import { useState, useEffect } from 'react';
import { authHeaders } from '@/app/lib/auth';
import { decryptResponse } from '@/app/lib/crypto';
import { toast } from 'react-toastify';
import AppPagination from '@/components/ui/AppPagination';

export default function ActivityTimeline({ userId }) {
  const LIMIT = 10;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const body = {
        page,
        limit: LIMIT,
        // Backend expects userId as a filter with key 'userProfileId'
        ...(userId ? {
          filters: [{ key: 'userProfileId', value: String(userId), operator: 'eq' }]
        } : {}),
      };

      const response = await fetch('/relayapi', {
        method: 'POST',
        headers: {
          ...authHeaders(),
          endpoint: 'list',
          module: 'activity',
        },
        body: JSON.stringify(body),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.message || 'Failed to fetch activity logs', { position: 'top-right' });
        setError(payload?.message || 'Failed to fetch');
        return;
      }

      const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
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
    fetchData(1);
  }, [userId]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchData(page);
  };

  const severityColor = (severity) => {
    if (severity === 'HIGH') return 'bg-red-100 text-red-700';
    if (severity === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-xl font-semibold text-gray-500">
          Loading activity logs...
        </div>
      )}

      {error && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-red-600 font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {activities.map((a) => (
            <div
              key={a.logId}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
                    {a.activityMaster?.activityCode?.charAt(0) ?? 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {a.activityMaster?.activityName ?? 'Activity'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {a.generatedMessage}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      {a.targetType && (
                        <span>Target: <span className="text-gray-600">{a.targetType} #{a.targetId}</span></span>
                      )}
                      {a.company?.companyName && (
                        <span>Company: <span className="text-gray-600">{a.company.companyName}</span></span>
                      )}
                      <span>Status: <span className={`font-medium ${a.executionStatus === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>{a.executionStatus}</span></span>
                    </div>
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
          ))}

          {activities.length === 0 && (
            <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
              No activity records found.
            </div>
          )}
        </div>
      )}

      <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}