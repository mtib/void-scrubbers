use std::env;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref CONFIG: AppConfig = AppConfig::from_env();
}

pub struct AppConfig {
    pub database_url: String,
    pub server_port: u16,
    pub jwt_secret: String,
    pub ws_port: u16,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/void_scrubbers".to_string());
        
        let server_port = env::var("PORT")
            .unwrap_or_else(|_| "8000".to_string())
            .parse::<u16>()
            .unwrap_or(8000);
            
        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "void_scrubbers_secret_key".to_string());
            
        let ws_port = env::var("WS_PORT")
            .unwrap_or_else(|_| "9000".to_string())
            .parse::<u16>()
            .unwrap_or(9000);
            
        Self {
            database_url,
            server_port,
            jwt_secret,
            ws_port,
        }
    }
}
