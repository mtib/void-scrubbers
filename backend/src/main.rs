#[macro_use]
extern crate rocket;
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Header, Method};
use rocket::{Request, Response};
use std::env;

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "CORS Fairing",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        if request.method() == Method::Options {
            response.set_status(rocket::http::Status::NoContent);
        }

        // In debug/development mode, allow any localhost origin
        // In production, use the configured WEB_HOST environment variable
        let origin = request.headers().get_one("Origin");
        let (require_cors, cors_origin) = match (origin, cfg!(debug_assertions)) {
            (Some(origin), true) if origin.starts_with("http://localhost") => {
                (true, Some(origin.to_string()))
            }
            (Some(_), false) => (true, env::var("WEB_HOST").ok()),
            _ => (false, None),
        };
        if require_cors {
            if let Some(cors_origin) = cors_origin {
                response.set_header(Header::new("Access-Control-Allow-Origin", cors_origin));
            } else {
                panic!("Warning: requiring CORS but no origin provided");
            }
            response.set_header(Header::new(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS",
            ));
            response.set_header(Header::new(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization",
            ));
            response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        }
    }
}

#[get("/")]
fn index() -> rocket::serde::json::Json<serde_json::Value> {
    let data = serde_json::json!({
        "message": "Hello, world!",
        "version": "1.0.0",
        "status": "online",
        "features": ["authentication", "user management", "game state"],
        "server_time": std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    });
    rocket::serde::json::Json(data)
}

#[options("/<_..>")]
fn all_options() {
    /* Intentionally left empty to just handle OPTIONS preflight requests */
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .attach(CORS)
        .mount("/", routes![index, all_options])
}
