function AuctionCard({ auction, onClick }) {
  return (
    <div
      onClick={() => onClick(auction.id)}
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white text-slate-900 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
    >
      {auction.image_url ? (
        <img
          src={`http://localhost:3000${auction.image_url}`}
          alt={auction.plant_title || 'Plant'}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
          No image
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{auction.plant_title || 'Untitled Plant'}</h3>

        <div className="mt-3 space-y-2">
          <p className="text-xl font-bold text-emerald-700">฿{Number(auction.current_price).toLocaleString()}</p>
          <p className="text-sm text-slate-600">
            End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuctionCard
