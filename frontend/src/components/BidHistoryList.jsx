function BidHistoryList({ bids }) {
  return (
    <div className="space-y-3">
      {bids.map((bid, index) => (
        <div key={`${bid.placed_at || bid.placedAt}-${index}`} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-slate-900">Amount: {bid.amount}</p>
          <p className="text-xs text-slate-600">Buyer: {bid.buyerEmail}</p>
          <p className="text-xs text-slate-500">
            {(() => {
              const time = bid.placed_at || bid.placedAt
              return `Placed at: ${time ? new Date(time).toLocaleString() : '-'}`
            })()}
          </p>
        </div>
      ))}
    </div>
  )
}

export default BidHistoryList
