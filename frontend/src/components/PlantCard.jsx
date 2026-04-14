function PlantCard({
  plant,
  onDelete,
  onEdit,
  showEditButton = false,
  statusBadge,
  createdLabel,
  children,
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{plant.title}</h2>
          <div className="mt-2">
            {plant.image_url ? (
              <img
                src={`http://localhost:3000${plant.image_url}`}
                alt={plant.title}
                className="h-32 w-48 rounded-lg border border-stone-200 object-cover"
              />
            ) : (
              <p className="text-sm text-slate-500">No image</p>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">{plant.description || 'No description'}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {statusBadge}
            <span className="bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-3 py-1 text-sm">
              {createdLabel}
            </span>
          </div>

          {children}
        </div>

        <div className="flex gap-2">
          {showEditButton ? (
            <button
              onClick={() => onEdit(plant)}
              className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-stone-100"
            >
              Edit
            </button>
          ) : null}
          <button
            onClick={() => onDelete(plant.id)}
            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlantCard
