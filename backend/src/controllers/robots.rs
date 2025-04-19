// Basic controller implementations for robots

use rocket::serde::json::Json;
use crate::models::Robot;
use crate::services::robots;
use crate::error::ApiError;
use crate::auth::AuthenticatedUser;

#[get("/<id>")]
pub async fn get_robot(id: String) -> Result<Json<Robot>, ApiError> {
    match robots::get_robot_by_id(&id).await {
        Some(robot) => Ok(Json(robot)),
        None => Err(ApiError::NotFound(format!("Robot with id {} not found", id))),
    }
}

#[post("/", data = "<robot_data>")]
pub async fn create_robot(user: AuthenticatedUser, robot_data: Json<RobotCreateRequest>) -> Result<Json<Robot>, ApiError> {
    let robot = robots::create_robot(user.user_id, robot_data.name.clone()).await;
    Ok(Json(robot))
}

// Request model for creating a robot
#[derive(serde::Deserialize)]
pub struct RobotCreateRequest {
    pub name: String,
}
