FROM rust:1.76 as builder

WORKDIR /usr/src/app

# Create a dummy project to cache dependencies
RUN cargo new --bin void-scrubbers-backend
WORKDIR /usr/src/app/void-scrubbers-backend
COPY Cargo.toml Cargo.lock* ./

# Build the dummy project to cache dependencies
RUN cargo build --release && \
    rm -rf src/ && \
    mkdir src/

# Copy the actual source code
COPY src ./src

# Build the real application
RUN cargo build --release

# Create a minimal runtime image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/void-scrubbers-backend/target/release/void-scrubbers-backend .

# Create directory for migrations
RUN mkdir -p /app/migrations

# Copy migrations if they exist
COPY migrations /app/migrations

# Set environment variables
ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000

EXPOSE 8000
EXPOSE 9000

CMD ["./void-scrubbers-backend"]
