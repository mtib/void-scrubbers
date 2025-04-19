use rocket::serde::json::{Json, Value};

pub mod health;

#[get("/")]
pub fn index() -> &'static str {
    "Welcome to Void Scrubbers API"
}
