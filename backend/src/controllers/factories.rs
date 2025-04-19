// Basic controller implementations for factories

use rocket::serde::json::Json;
use crate::models::Factory;
use crate::services::factories;
use crate::error::ApiError;
use crate::auth::AuthenticatedUser;

#[get("/")]
pub async fn get_factories(user: AuthenticatedUser) -> Result<Json<Vec<Factory>>, ApiError> {
    let factories = factories::get_factories_for_user(&user.user_id).await;
    Ok(Json(factories))
}
