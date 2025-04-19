use rocket::serde::json::Json;
use rocket::serde::{Deserialize, Serialize};

/// Response for health check endpoint
#[derive(Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}

#[get("/")]
pub fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}
