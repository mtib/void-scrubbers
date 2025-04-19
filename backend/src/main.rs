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
    
    let rocket = rocket::build()
        .mount("/", routes![routes::index])
        .mount("/api/health", routes![routes::health::health_check])
        .launch()
        .await?;
    
    Ok(())
}
