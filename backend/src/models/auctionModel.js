// In-memory model placeholder (replace with PostgreSQL queries later)
const auctionStore = {
  id: 'auction-001',
  plantName: 'Monstera Albo Variegata',
  currentBid: 120,
  currency: 'THB',
}

function getAuction() {
  return auctionStore
}

function updateBid(newBidAmount) {
  auctionStore.currentBid = newBidAmount
  return auctionStore
}

module.exports = {
  getAuction,
  updateBid,
}
