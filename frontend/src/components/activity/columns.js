export const activityColumns = [
  {
    accessorKey: 'actionCode',
    header: 'Action',
    cell: ({ row }) => <span className="font-medium text-[#3563e9]">{row.original.actionCode}</span>,
  },
  {
    accessorKey: 'actionName',
    header: 'Name',
    cell: ({ row }) => <span>{row.original.actionName}</span>,
  },
  {
    accessorKey: 'actor',
    header: 'Actor',
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <span className="font-medium">{row.original.actorName}</span>
        <span className="text-xs text-gray-500">(ID:{row.original.actorId})</span>
      </div>
    ),
  },
  {
    accessorKey: 'company',
    header: 'Company',
    cell: ({ row }) => row.original.companyName || '-',
  },
  {
    accessorKey: 'target',
    header: 'Target',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.targetType}</span>
        <span className="text-xs text-gray-500">{row.original.targetId}</span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 text-xs rounded ${{
          SUCCESS: 'bg-green-100 text-green-700',
          FAILURE: 'bg-red-100 text-red-700',
          PENDING: 'bg-yellow-100 text-yellow-700',
        }[row.original.executionStatus]}`}
      >
        {row.original.executionStatus}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: ({ row }) => (
      <button
        className="text-sm text-blue-600 hover:underline"
        onClick={() => alert(JSON.stringify(row.original.parameters, null, 2))}
      >
        View
      </button>
    ),
  },
];
