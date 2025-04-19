# Backend - Void Scrubbers

This directory contains the server-side code for Void Scrubbers.

## 📋 Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) (comes with Rust)

## 🚀 Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the development server:
   ```bash
   cargo run
   ```

   This will start the server at `http://localhost:8000` by default.

## 📦 Build

To build the project for production:

```bash
cargo build --release
```

The compiled binary will be located in `target/release/`.

## 🧪 Testing

To run tests:

```bash
cargo test
```

## 🔧 Project Structure

```
backend/
├── src/
│   ├── auth/        # Authentication and authorization
│   ├── controllers/ # Request handlers
│   ├── db/          # Database interactions
│   ├── models/      # Data models
│   ├── routes/      # API route definitions
│   ├── services/    # Business logic
│   ├── websocket/   # WebSocket handling
│   ├── config.rs    # Configuration management
│   ├── error.rs     # Error handling
│   ├── lib.rs       # Library exports
│   └── main.rs      # Application entry point
├── tests/           # Integration tests
├── Cargo.toml       # Project dependencies
└── Cargo.lock       # Dependency lock file
```

## 🔄 Continuous Deployment

The backend is automatically built when changes are pushed to the main branch. The build process is handled by a GitHub Actions workflow defined in the repository's root directory.

## 📝 API Documentation

Once the server is running, API documentation can be accessed at `http://localhost:8000/api/docs` (when in development mode).
