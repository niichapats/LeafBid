function StatusBadge({ status, children }) {
  const normalizedStatus = String(status || '').toLowerCase()

  const classMap = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-sm',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-3 py-1 text-sm',
    scheduled: 'bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-sm',
    ended: 'bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-3 py-1 text-sm',
  }

  const defaultLabel = normalizedStatus ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1) : '-'

  return <span className={classMap[normalizedStatus] || classMap.ended}>{children || defaultLabel}</span>
}

export default StatusBadge
