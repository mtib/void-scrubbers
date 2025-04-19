# Legends of the void

This is a WIP indie browser game. These are the cornerstones of it:

- Idle RPG:
  - You have an account, a characters that grow based on stuff you build in a factory-like environment
  - The factory produces things, the production can be used to increase your characters stats. (Very much inspired by Factory)
  - You can trade factory products with other players online on a market, this gives you the resource to build more, and them rare resources that they may not be able to produce. (Very much inspired by Screeps and FFXIV)
  - You have to play the other parts of the game to unlock factory buildings, and randomly may be able to find raw resource nodes to put on your factory.
  - There's a hierarchy of products, more complex producs may sell for more on the player-driven markets, but also are required for better character stat improvements.
- Action RPG:
  - Open world of islands the players can travel to.
  - Monsters and resources spawn on the overworld. (Very much inspired by Flyff)
  - Dungeon instances.
  - Online: other people are there
  - Top down (30deg-ish visually) rendered, twin-stick fighting (Very much inspired by cult of the lamb)
- Couch-coop:
  - Supports multiple players being logged in at once, playing their own character in split screen.
  - They can individually pause and edit their factory while playing like this.
  - They can visit each other's factory and help build it.
  - They can play the Action RPG part of the game together
- Online:
  - Live online MMORPG using websockets
  - Chat feature if not using controllers, (controllers get emotes)
- Frontend:
  - PixiJS + Vite + Typescript, deployed on GitHub pages
  - Websockets
- Backend:
  - Rust + Rocket
  - Websockets
- Auth:
  - one-time auth tokens tied to email, using mailgun

I'm no artist, so my plan is to buy an art asset bundle to get started.
