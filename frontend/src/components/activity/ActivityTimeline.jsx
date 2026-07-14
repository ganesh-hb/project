"use client";
import { useState, useEffect, useRef } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { authHeaders } from '@/app/lib/auth';
import { decryptResponse } from '@/app/lib/crypto';
import { toast } from 'react-toastify';
import AppPagination from '@/components/ui/AppPagination';

const toIsoDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().split('T')[0];
};

const formatDisplay = (date) =>
  date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export default function ActivityTimeline({ userId }) {
  const LIMIT = 10;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Date range filter state ──
  const [showPicker, setShowPicker] = useState(false);
  const [draftRange, setDraftRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [appliedRange, setAppliedRange] = useState(null); // { startDate, endDate } once "Apply" is clicked
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const fetchData = async (page = 1, range = appliedRange) => {
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
        ...(range?.startDate ? { startDate: toIsoDate(range.startDate) } : {}),
        ...(range?.endDate ? { endDate: toIsoDate(range.endDate) } : {}),
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
    setCurrentPage(1);
    fetchData(1, appliedRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, appliedRange]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchData(page, appliedRange);
  };

  const handleApplyRange = () => {
    setAppliedRange({ startDate: draftRange.startDate, endDate: draftRange.endDate });
    setShowPicker(false);
  };

  const handleClearRange = () => {
    setDraftRange({ startDate: new Date(), endDate: new Date(), key: 'selection' });
    setAppliedRange(null);
    setShowPicker(false);
  };

  const severityColor = (severity) => {
    if (severity === 'HIGH') return 'bg-red-100 text-red-700';
    if (severity === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="w-full">
      {/* ── Date range filter ── */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => {
              if (!showPicker && appliedRange) {
                setDraftRange({ ...appliedRange, key: 'selection' });
              }
              setShowPicker((s) => !s);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <span>📅</span>
            {appliedRange ? (
              <span>
                {formatDisplay(appliedRange.startDate)} - {formatDisplay(appliedRange.endDate)}
              </span>
            ) : (
              <span>Filter by Date</span>
            )}
          </button>

          {appliedRange && (
            <button
              type="button"
              onClick={handleClearRange}
              className="ml-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-red-600"
              title="Clear date filter"
            >
              ✕
            </button>
          )}

          {showPicker && (
            <div className="absolute left-0 z-40 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl">
              <DateRange
                ranges={[draftRange]}
                onChange={(item) => setDraftRange(item.selection)}
                moveRangeOnFirstSelection={false}
                editableDateInputs={true}
                maxDate={new Date()}
                rangeColors={['#2563eb']}
              />
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyRange}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
                    {a.activityCode?.charAt(0) ?? 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {a.activityName ?? 'Activity'}
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
              No activity records found{appliedRange ? ' for the selected date range' : ''}.
            </div>
          )}
        </div>
      )}

      <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}