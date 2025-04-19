use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use rocket::http::Status;
use rocket::request::{Outcome, Request, FromRequest};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::config::CONFIG;
use crate::error::ApiError;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // User ID
    pub exp: u64,     // Expiration time (seconds since UNIX epoch)
    pub iat: u64,     // Issued at (seconds since UNIX epoch)
}

#[derive(Debug)]
pub struct AuthenticatedUser {
    pub user_id: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthenticatedUser {
    type Error = ApiError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        // Get the authorization header
        let auth_header = match request.headers().get_one("Authorization") {
            Some(header) => header,
            None => {
                return Outcome::Error((
                    Status::Unauthorized,
                    ApiError::Unauthorized("Missing Authorization header".to_string()),
                ));
            }
        };

        // Check if it's a Bearer token
        if !auth_header.starts_with("Bearer ") {
            return Outcome::Error((
                Status::Unauthorized,
                ApiError::Unauthorized("Invalid Authorization header format".to_string()),
            ));
        }

        // Extract the token
        let token = &auth_header[7..]; // Skip "Bearer "

        // Validate the token
        match validate_token(token) {
            Ok(claims) => Outcome::Success(AuthenticatedUser {
                user_id: claims.sub,
            }),
            Err(err) => Outcome::Error((Status::Unauthorized, err)),
        }
    }
}

/// Create a JWT token for a user
pub fn create_token(user_id: &str) -> Result<String, ApiError> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| ApiError::InternalServerError(format!("SystemTime error: {}", e)))?
        .as_secs();

    let claims = Claims {
        sub: user_id.to_string(),
        exp: now + 24 * 3600, // Token valid for 24 hours
        iat: now,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(CONFIG.jwt_secret.as_bytes()),
    )
    .map_err(|e| ApiError::InternalServerError(format!("Error creating token: {}", e)))
}

/// Validate a JWT token
pub fn validate_token(token: &str) -> Result<Claims, ApiError> {
    let validation = Validation::default();

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(CONFIG.jwt_secret.as_bytes()),
        &validation,
    )
    .map_err(|e| ApiError::Unauthorized(format!("Invalid token: {}", e)))?;

    Ok(token_data.claims)
}

/// Create a simple one-time token for email authentication
pub fn create_one_time_token() -> String {
    Uuid::new_v4().to_string()
}
