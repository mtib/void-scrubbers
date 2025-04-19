use sqlx::postgres::{PgPool, PgPoolOptions};
use tracing::{info, error};

use crate::config::CONFIG;
use crate::error::ApiError;

/// Initialize the database connection pool
pub async fn init_db() -> Result<PgPool, ApiError> {
    info!("Initializing database connection pool");
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&CONFIG.database_url)
        .await
        .map_err(|e| {
            error!("Failed to connect to database: {}", e);
            ApiError::DatabaseError(format!("Failed to connect to database: {}", e))
        })?;
    
    info!("Database connection pool established");
    
    Ok(pool)
}

/// Run database migrations
pub async fn run_migrations(pool: &PgPool) -> Result<(), ApiError> {
    info!("Running database migrations");
    
    // This will run migrations from the ./migrations directory
    // When you create actual migrations, use sqlx-cli
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .map_err(|e| {
            error!("Failed to run migrations: {}", e);
            ApiError::DatabaseError(format!("Failed to run migrations: {}", e))
        })?;
    
    info!("Database migrations completed successfully");
    
    Ok(())
}
