#[macro_use]
extern crate rocket;

use dotenv::dotenv;
use rocket::fs::{FileServer, relative};
use rocket::http::Method;
use rocket::serde::json::{Json, Value};
use rocket::{Build, Rocket};
use rocket::routes;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;
use std::thread;

mod config;
mod error;
mod routes;
mod models;
mod services;
mod controllers;
mod db;
mod auth;
mod websocket;

/// Initialize the application's logging system
fn setup_logging() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set up the global logger");
}

/// Configure and build the Rocket instance
#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    // Load environment variables
    dotenv().ok();
    
    // Set up logging
    setup_logging();
    
    info!("Starting Void Scrubbers backend server");
    
    // Start WebSocket server in a separate thread
    let ws_thread = thread::spawn(|| {
        let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");
        rt.block_on(async {
            info!("Starting WebSocket server");
            websocket::start_ws_server().await;
        });
    });
    
    // Connect to database
    info!("Connecting to database");
    let db_pool = match db::init_db().await {
        Ok(pool) => {
            info!("Database connection established");
            pool
        },
        Err(e) => {
            eprintln!("Failed to connect to database: {}", e);
            // Continue without database for now - makes development easier
            info!("Continuing without database connection");
            sqlx::postgres::PgPool::connect("postgres://postgres:postgres@localhost/void_scrubbers")
                .await
                .expect("Failed to create empty database pool")
        }
    };
    
    // Start the Rocket web server
    let rocket = rocket::build()
        .mount("/", routes![routes::index])
        .mount("/api/health", routes![routes::health::health_check])
        .launch()
        .await?;
    
    Ok(())
}
