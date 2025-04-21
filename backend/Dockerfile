# Use the official Rust image as the base image
FROM rust:1.86.0-slim as builder

# Create a new empty shell project
WORKDIR /usr/src/void_scrubbers_api
RUN cargo init

# Copy over manifests
COPY Cargo.toml ./

# This is a trick to cache dependencies
# It will build all dependencies and cache them
RUN cargo build --release
RUN rm src/*.rs

# Now copy the actual source code
COPY src/ ./src/

# Update the file date so cargo will actually rebuild the source
RUN touch src/main.rs

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install necessary dependencies for runtime
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /usr/src/void_scrubbers_api/target/release/void_scrubbers_api /usr/local/bin/void_scrubbers_api

ENV ROCKET_ADDRESS "0.0.0.0"

EXPOSE 8000

# Run the binary
CMD ["void_scrubbers_api"]
