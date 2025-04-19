use rocket::http::Status;
use rocket::request::Request;
use rocket::response::{self, Responder, Response};
use rocket::serde::json::{json, Value};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    
    #[error("Forbidden: {0}")]
    Forbidden(String),
    
    #[error("Bad request: {0}")]
    BadRequest(String),
    
    #[error("Internal server error: {0}")]
    InternalServerError(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
}

impl<'r> Responder<'r, 'static> for ApiError {
    fn respond_to(self, req: &'r Request<'_>) -> response::Result<'static> {
        let (status, message) = match self {
            ApiError::NotFound(msg) => (Status::NotFound, msg),
            ApiError::Unauthorized(msg) => (Status::Unauthorized, msg),
            ApiError::Forbidden(msg) => (Status::Forbidden, msg),
            ApiError::BadRequest(msg) => (Status::BadRequest, msg),
            ApiError::InternalServerError(msg) => (Status::InternalServerError, msg),
            ApiError::DatabaseError(msg) => (Status::InternalServerError, format!("Database error: {}", msg)),
        };
        
        let json_response = json!({
            "status": "error",
            "code": status.code,
            "message": message
        });
        
        Response::build_from(json_response.respond_to(req)?)
            .status(status)
            .ok()
    }
}
