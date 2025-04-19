// Basic service implementations for factories

use crate::models::Factory;
use uuid::Uuid;

pub async fn get_factories_for_user(_user_id: &str) -> Vec<Factory> {
    // Placeholder implementation
    Vec::new()
}
