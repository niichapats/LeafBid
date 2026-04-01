CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('buyer','seller','admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plants (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auctions (
  id SERIAL PRIMARY KEY,
  plant_id INTEGER NOT NULL UNIQUE REFERENCES plants(id) ON DELETE CASCADE,
  start_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','ended')),
  winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  placed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bids_auction_id ON bids(auction_id);
