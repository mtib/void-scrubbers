# Void Scrubbers

A work-in-progress indie browser game where little robots scrub a digital world of pollutants, using the very factories that produce them.

## 🎮 Game Overview

This project combines several gameplay elements to create a unique gaming experience:

### Idle Factory Management
- Upgrade your cleaning robots through factory-based resource management
- Factory production system to enhance robot capabilities (inspired by [Factory Idle](https://factoryidle.com/))
- Player-driven markets for trading factory products and cleaning supplies (inspired by [Screeps](https://screeps.com/) and [Final Fantasy XIV](https://www.finalfantasyxiv.com/))
- Balance between factory output and pollution generation
- Discover resource nodes in the world to expand your factory
- Create complex products for better market value and robot enhancements

### Action RPG Cleaning
- Control your robots to scrub pollutants from the digital world
- Explore an open world of digital islands
- Encounter corrupted data entities and collect resources in the overworld (inspired by [Flyff](https://play.flyff.com/))
- Clean heavily polluted dungeon instances
- Experience a living online world with other cleaning robots
- Enjoy top-down, twin-stick cleaning combat (inspired by [Cult of the Lamb](https://cultofthelamb.com/))

### Couch Co-op
- Support for multiple robots on the same screen
- Individually pause and manage factories
- Visit and help optimize each other's factories
- Team up for more efficient pollution cleanup

### Online Features
- Live MMORPG experience using WebSockets
- Text chat for keyboard/mouse players
- Emote system for controller players

## 🛠️ Technical Stack

### Frontend
- [PixiJS](https://pixijs.com/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- Deployed on [GitHub Pages](https://pages.github.com/)
- WebSockets for real-time communication

### Backend
- [Rust](https://www.rust-lang.org/) + [Rocket](https://rocket.rs/)
- WebSockets for real-time updates

### Authentication
- One-time auth tokens tied to email using [Mailgun](https://www.mailgun.com/)

## 🎨 Art & Assets
Currently planning to purchase asset bundles to get started with the game's visual design.

## 📁 Project Structure
- `/frontend` - Game client code
- `/backend` - Game server code
- `/scripts` - Development utility scripts

## 🚀 Getting Started

See the README files in the [frontend](/frontend) and [backend](/backend) directories for setup instructions.
