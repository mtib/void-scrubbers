// Basic controller implementations for users

use rocket::serde::json::Json;
use crate::models::User;
use crate::services::users;
use crate::error::ApiError;

#[get("/<id>")]
pub async fn get_user(id: String) -> Result<Json<User>, ApiError> {
    match users::get_user_by_id(&id).await {
        Some(user) => Ok(Json(user)),
        None => Err(ApiError::NotFound(format!("User with id {} not found", id))),
    }
}

#[post("/", data = "<user_data>")]
pub async fn create_user(user_data: Json<UserCreateRequest>) -> Result<Json<User>, ApiError> {
    let user = users::create_user(user_data.username.clone(), user_data.email.clone()).await;
    Ok(Json(user))
}

// Request model for creating a user
#[derive(serde::Deserialize)]
pub struct UserCreateRequest {
    pub username: String,
    pub email: String,
}
