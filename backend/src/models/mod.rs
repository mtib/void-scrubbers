use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Base model for a user in the system
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl User {
    pub fn new(username: String, email: String) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            username,
            email,
            created_at: now,
            updated_at: now,
        }
    }
}

// Robot model - representing the cleaning robots players control
#[derive(Debug, Serialize, Deserialize)]
pub struct Robot {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub level: i32,
    pub experience: i64,
    pub cleaning_power: i32,
    pub movement_speed: f32,
    pub battery_capacity: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl Robot {
    pub fn new(user_id: String, name: String) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            user_id,
            name,
            level: 1,
            experience: 0,
            cleaning_power: 10,
            movement_speed: 1.0,
            battery_capacity: 100,
            created_at: now,
            updated_at: now,
        }
    }
}

// Factory model - factories produce resources and upgrades
#[derive(Debug, Serialize, Deserialize)]
pub struct Factory {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub level: i32,
    pub pollution_rate: f32,
    pub production_rate: f32,
    pub efficiency: f32,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

// Resource model - resources gathered and used in the game
#[derive(Debug, Serialize, Deserialize)]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub description: String,
    pub rarity: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

// Pollutant model - environmental hazards that robots must clean
#[derive(Debug, Serialize, Deserialize)]
pub struct Pollutant {
    pub id: String,
    pub name: String,
    pub description: String,
    pub difficulty: i32,
    pub health: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
}
