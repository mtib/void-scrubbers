// Basic controller implementations for game world and pollution

use rocket::serde::json::Json;
use crate::services::world;
use crate::error::ApiError;
use serde::Serialize;

#[get("/pollution")]
pub async fn get_pollution() -> Result<Json<PollutionResponse>, ApiError> {
    let level = world::get_world_pollution_level().await;
    Ok(Json(PollutionResponse { level }))
}

#[get("/pollutants")]
pub async fn get_pollutants() -> Result<Json<PollutantsResponse>, ApiError> {
    let pollutants = world::get_active_pollutants().await;
    Ok(Json(PollutantsResponse { pollutants }))
}

// Response models
#[derive(Serialize)]
pub struct PollutionResponse {
    pub level: f32,
}

#[derive(Serialize)]
pub struct PollutantsResponse {
    pub pollutants: Vec<crate::models::Pollutant>,
}
