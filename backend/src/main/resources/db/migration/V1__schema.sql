-- PostgreSQL DDL Schema for ConciergeIQ

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'GUEST', -- 'GUEST', 'STAFF', 'ADMIN'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Preference profiles table
CREATE TABLE preference_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interests TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'BEACH', 'ADVENTURE', 'CULTURE'}
    food_preferences TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'VEGAN', 'SEAFOOD'}
    accommodation_preferences TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'LUXURY', 'BOUTIQUE'}
    budget_tier VARCHAR(50) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    mobility_level VARCHAR(50) DEFAULT 'STANDARD', -- 'STANDARD', 'REDUCED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotels table
CREATE TABLE hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    contact_number VARCHAR(50),
    image_urls TEXT[] DEFAULT '{}',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED'
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE restaurants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100) NOT NULL,
    average_price DECIMAL(10, 2) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    contact_number VARCHAR(50),
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    reservation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    party_size INT NOT NULL DEFAULT 2,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'MUSIC', 'SPORTS', 'FOOD', 'MUSEUMS', 'NIGHTLIFE', 'ADVENTURE'
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    capacity INT NOT NULL,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Tickets table
CREATE TABLE event_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED'
    purchase_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'HOTEL', 'RESTAURANT', 'ATTRACTION'
    target_id BIGINT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    replies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    reservation_id BIGINT REFERENCES reservations(id) ON DELETE SET NULL,
    ticket_id BIGINT REFERENCES event_tickets(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL, -- 'STRIPE', 'RAZORPAY'
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'PAID', -- 'PAID', 'FAILED', 'REFUNDED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_limit DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    budget_spent DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Schedules table
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    scheduled_time TIME NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'HOTEL', 'RESTAURANT', 'EVENT', 'ATTRACTION', 'LEISURE'
    activity_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED', -- 'PLANNED', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'BOOKING', 'WEATHER', 'ITINERARY', 'PROMO'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Histories table
CREATE TABLE chat_histories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'USER', 'ASSISTANT'
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Embeddings table for local OpenSearch/Vector fallback search
CREATE TABLE embeddings (
    id BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL, -- 'ATTRACTION', 'RESTAURANT', 'EVENT'
    target_id BIGINT NOT NULL,
    description_chunk TEXT NOT NULL,
    vector_data TEXT NOT NULL, -- Stored as comma-separated floats or stringified floats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance Optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_event_tickets_user_id ON event_tickets(user_id);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_schedules_trip_id ON schedules(trip_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_chat_histories_user_id ON chat_histories(user_id);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_embeddings_target ON embeddings(target_type, target_id);
