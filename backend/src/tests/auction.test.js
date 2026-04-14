import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const connectMock = jest.fn()

jest.unstable_mockModule('../database/db.js', () => ({
  default: {
    connect: connectMock,
  },
}))

const { placeBid } = await import('../models/auctionModel.js')

function createClientWithQueryImpl(queryImpl) {
  return {
    query: jest.fn(queryImpl),
    release: jest.fn(),
  }
}

describe('placeBid unit tests', () => {
  beforeEach(() => {
    connectMock.mockReset()
  })

  it('rejects bid lower than current price', async () => {
    const client = createClientWithQueryImpl((sql) => {
      if (sql === 'BEGIN') return Promise.resolve()
      if (sql.startsWith('SELECT * FROM auctions')) {
        return Promise.resolve({ rows: [{ id: 1, status: 'active', current_price: 1000 }] })
      }
      if (sql === 'ROLLBACK') return Promise.resolve()
      return Promise.resolve({ rows: [] })
    })

    connectMock.mockResolvedValue(client)

    await expect(placeBid(1, 10, 900)).rejects.toThrow('Bid must be at least ฿100 higher than current price')
    expect(client.query).toHaveBeenCalledWith('ROLLBACK')
    expect(client.release).toHaveBeenCalled()
  })

  it('rejects bid less than 100 above current price', async () => {
    const client = createClientWithQueryImpl((sql) => {
      if (sql === 'BEGIN') return Promise.resolve()
      if (sql.startsWith('SELECT * FROM auctions')) {
        return Promise.resolve({ rows: [{ id: 1, status: 'active', current_price: 1000 }] })
      }
      if (sql === 'ROLLBACK') return Promise.resolve()
      return Promise.resolve({ rows: [] })
    })

    connectMock.mockResolvedValue(client)

    await expect(placeBid(1, 10, 1050)).rejects.toThrow('Bid must be at least ฿100 higher than current price')
    expect(client.query).toHaveBeenCalledWith('ROLLBACK')
    expect(client.release).toHaveBeenCalled()
  })

  it('accepts valid bid amount', async () => {
    const updatedAuction = { id: 1, current_price: 1100, status: 'active' }
    const insertedBid = { id: 20, auction_id: 1, buyer_id: 10, amount: 1100 }

    const client = createClientWithQueryImpl((sql) => {
      if (sql === 'BEGIN') return Promise.resolve()
      if (sql.startsWith('SELECT * FROM auctions')) {
        return Promise.resolve({ rows: [{ id: 1, status: 'active', current_price: 1000 }] })
      }
      if (sql.startsWith('UPDATE auctions SET current_price')) {
        return Promise.resolve({ rows: [updatedAuction] })
      }
      if (sql.startsWith('INSERT INTO bids')) {
        return Promise.resolve({ rows: [insertedBid] })
      }
      if (sql === 'COMMIT') return Promise.resolve()
      return Promise.resolve({ rows: [] })
    })

    connectMock.mockResolvedValue(client)

    const result = await placeBid(1, 10, 1100)

    expect(result).toEqual({ auction: updatedAuction, bid: insertedBid })
    expect(client.query).toHaveBeenCalledWith('COMMIT')
    expect(client.release).toHaveBeenCalled()
  })

  it('rejects bid on ended auction', async () => {
    const client = createClientWithQueryImpl((sql) => {
      if (sql === 'BEGIN') return Promise.resolve()
      if (sql.startsWith('SELECT * FROM auctions')) {
        return Promise.resolve({ rows: [{ id: 1, status: 'ended', current_price: 1000 }] })
      }
      if (sql === 'ROLLBACK') return Promise.resolve()
      return Promise.resolve({ rows: [] })
    })

    connectMock.mockResolvedValue(client)

    await expect(placeBid(1, 10, 1200)).rejects.toThrow('Auction is not active')
    expect(client.query).toHaveBeenCalledWith('ROLLBACK')
    expect(client.release).toHaveBeenCalled()
  })
})
