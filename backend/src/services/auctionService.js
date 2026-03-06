const auctionModel = require('../models/auctionModel')

function getCurrentAuction() {
  return auctionModel.getAuction()
}

function placeBid(amount) {
  const auction = auctionModel.getAuction()

  if (amount <= auction.currentBid) {
    const error = new Error('Bid must be higher than current bid.')
    error.statusCode = 400
    throw error
  }

  return auctionModel.updateBid(amount)
}

module.exports = {
  getCurrentAuction,
  placeBid,
}
