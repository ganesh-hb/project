"use client";
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { authHeaders } from '@/app/lib/auth';

export default function ActivityFilters({ onFilterChange }) {
  const [activityTypes, setActivityTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [filters, setFilters] = useState({
    activityType: '',
    userId: '',
    companyId: '',
    startDate: '',
    endDate: '',
  });

  // Fetch filter options once (activity master, users, companies)
  useEffect(() => {
    // Activity types (master list)
    fetch('/relayapi', {
      method: 'POST',
      headers: { ...authHeaders(), endpoint: 'activity-master-list', module: 'activity' },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((p) => {
        const data = p.encrypted ? JSON.parse(atob(p.encrypted)) : p;
        setActivityTypes(data?.data ?? []);
      })
      .catch(() => setActivityTypes([]));

    // Users list (light)
    fetch('/relayapi', {
      method: 'POST',
      headers: { ...authHeaders(), endpoint: 'user-list', module: 'user' },
      body: JSON.stringify({ limit: 1000 }),
    })
      .then((r) => r.json())
      .then((p) => {
        const data = p.encrypted ? JSON.parse(atob(p.encrypted)) : p;
        setUsers(data?.data ?? []);
      })
      .catch(() => setUsers([]));

    // Companies list
    fetch('/relayapi', {
      method: 'POST',
      headers: { ...authHeaders(), endpoint: 'company-list', module: 'company' },
      body: JSON.stringify({ limit: 1000 }),
    })
      .then((r) => r.json())
      .then((p) => {
        const data = p.encrypted ? JSON.parse(atob(p.encrypted)) : p;
        setCompanies(data?.data ?? []);
      })
      .catch(() => setCompanies([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    // Debounce not needed – immediate for simplicity
    onFilterChange(newFilters);
  };

  return (
    <Header
      page="activity"
      extraControls={
        <div className="flex flex-wrap items-center gap-3">
          <select
            name="activityType"
            className="rounded border px-2 py-1"
            value={filters.activityType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            {activityTypes.map((t) => (
              <option key={t.id} value={t.code}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            name="userId"
            className="rounded border px-2 py-1"
            value={filters.userId}
            onChange={handleChange}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            name="companyId"
            className="rounded border px-2 py-1"
            value={filters.companyId}
            onChange={handleChange}
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="startDate"
            className="rounded border px-2 py-1"
            value={filters.startDate}
            onChange={handleChange}
          />
          <input
            type="date"
            name="endDate"
            className="rounded border px-2 py-1"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>
      }
    />
  );
}
