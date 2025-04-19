use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::protocol::Message;
use uuid::Uuid;
use tracing::{info, error};
use futures::{SinkExt, StreamExt};

use crate::config::CONFIG;

type ClientMap = Arc<Mutex<HashMap<String, mpsc::UnboundedSender<Message>>>>;

/// Start the WebSocket server
pub async fn start_ws_server() {
    let addr = format!("127.0.0.1:{}", CONFIG.ws_port);
    info!("Starting WebSocket server on {}", addr);
    
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind WebSocket server");
    let clients: ClientMap = Arc::new(Mutex::new(HashMap::new()));
    
    while let Ok((stream, addr)) = listener.accept().await {
        info!("WebSocket connection from: {}", addr);
        tokio::spawn(handle_connection(stream, clients.clone()));
    }
}

async fn handle_connection(stream: TcpStream, clients: ClientMap) {
    let addr = stream.peer_addr().expect("Connected streams should have a peer address");
    info!("Handling WebSocket connection from {}", addr);
    
    let ws_stream = match tokio_tungstenite::accept_async(stream).await {
        Ok(ws_stream) => ws_stream,
        Err(e) => {
            error!("Error during WebSocket handshake: {}", e);
            return;
        }
    };
    
    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();
    
    let client_id = Uuid::new_v4().to_string();
    
    // Insert the sender into the client map
    clients.lock().unwrap().insert(client_id.clone(), tx);
    
    // Task to forward messages from the MPSC channel to the WebSocket
    let forward_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if let Err(e) = ws_sender.send(msg).await {
                error!("Error sending WebSocket message: {}", e);
                break;
            }
        }
    });
    
    // Process incoming WebSocket messages
    while let Some(result) = ws_receiver.next().await {
        match result {
            Ok(msg) => {
                if msg.is_close() {
                    break;
                }
                
                // Process the message (you would add game-specific logic here)
                if let Message::Text(text) = msg {
                    info!("Received message from {}: {}", client_id, text);
                    
                    // Echo the message back for now
                    let clients_lock = clients.lock().unwrap();
                    if let Some(sender) = clients_lock.get(&client_id) {
                        let _ = sender.send(Message::Text(format!("Echo: {}", text)));
                    }
                }
            }
            Err(e) => {
                error!("Error receiving WebSocket message: {}", e);
                break;
            }
        }
    }
    
    // Remove the client when they disconnect
    info!("WebSocket client {} disconnected", client_id);
    clients.lock().unwrap().remove(&client_id);
    
    // Cancel the forward task
    forward_task.abort();
}

/// Send a message to a specific client
pub fn send_to_client(client_id: &str, message: &str, clients: &ClientMap) -> bool {
    let clients_lock = clients.lock().unwrap();
    if let Some(sender) = clients_lock.get(client_id) {
        match sender.send(Message::Text(message.to_string())) {
            Ok(_) => true,
            Err(e) => {
                error!("Failed to send message to client {}: {}", client_id, e);
                false
            }
        }
    } else {
        false
    }
}

/// Broadcast a message to all connected clients
pub fn broadcast(message: &str, clients: &ClientMap) {
    let clients_lock = clients.lock().unwrap();
    for (client_id, sender) in clients_lock.iter() {
        if let Err(e) = sender.send(Message::Text(message.to_string())) {
            error!("Failed to broadcast to client {}: {}", client_id, e);
        }
    }
}
