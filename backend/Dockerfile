FROM rust:1.86.0-slim AS builder

WORKDIR /usr/src/app

# Install dependencies for building
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Create a dummy project to cache dependencies
RUN cargo new --bin void-scrubbers-backend
WORKDIR /usr/src/app/void-scrubbers-backend
COPY Cargo.toml Cargo.lock* ./

# Build the dummy project to cache dependencies
RUN cargo build --release && \
    rm -rf src/ && \
    rm target/release/deps/void_scrubbers_backend*

# Copy the actual source code
COPY src ./src
# Copy migrations if they exist
COPY migrations* ./migrations/

# Build the real application
RUN cargo build --release

# Create a minimal runtime image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/void-scrubbers-backend/target/release/void-scrubbers-backend .

# Create directory for migrations if it doesn't exist
RUN mkdir -p /app/migrations

# Copy migrations from builder
COPY --from=builder /usr/src/app/void-scrubbers-backend/migrations /app/migrations

# Set environment variables
ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000
ENV PORT=8000
ENV WS_PORT=9000

EXPOSE 8000
EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["./void-scrubbers-backend"]
