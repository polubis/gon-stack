// Types
type Position = {
  x: number;
  y: number;
};

type Character = {
  size: number;
  position: Position;
  speed: number;
};

type Game = {
  lifes: number;
  enemiesKilled: number;
  player: Character;
  enemies: Character[];
  events: Set<string>;
  updatePlayerPostion: () => void;
  addEvent: (event: string) => void;
  removeEvent: (event: string) => void;
};

// Player constants
const PLAYER_SIZE = 25;
const PLAYER_SPEED = 5;
const PLAYER_START_POSITION_X = 250 - PLAYER_SIZE / 2;
const PLAYER_START_POSITION_Y = 250 - PLAYER_SIZE / 2;
const PLAYER_LIFES = 3;

// enemy constants
const ENEMY_SIZE_SM = 20;
const ENEMY_SIZE_LG = 30;
const ENEMY_SPEED = 5;

// key constants
const KEY_UP = 'ArrowUp';
const KEY_DOWN = 'ArrowDown';
const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';

const enemyFactory = (size: number): Character => {
  const randomX = Math.random() * (500 - ENEMY_SIZE_LG);
  const randomY = Math.random() * (300 - ENEMY_SIZE_LG);

  return {
    size,
    position: {
      x: randomX,
      y: randomY,
    },
    speed: ENEMY_SPEED,
  };
};

const player: Character = {
  size: PLAYER_SIZE,
  position: {
    x: PLAYER_START_POSITION_X,
    y: PLAYER_START_POSITION_Y,
  },
  speed: PLAYER_SPEED,
};

export const game: Game = {
  lifes: PLAYER_LIFES,
  enemiesKilled: 0,
  player,
  enemies: [],
  events: new Set<string>(),

  updatePlayerPostion: () => {
    switch (true) {
      case game.events.has(KEY_UP):
        player.position.y -= player.speed;
        break;
      case game.events.has(KEY_DOWN):
        player.position.y += player.speed;
        break;
      case game.events.has(KEY_LEFT):
        player.position.x -= player.speed;
        break;
      case game.events.has(KEY_RIGHT):
        player.position.x += player.speed;
        break;
    }
  },

  addEvent: (key: string) => {
    game.events.add(key);
  },
  removeEvent: (key: string) => {
    game.events.delete(key);
  },
};

for (let i = 0; i < 5; i++) {
  game.enemies.push(enemyFactory(ENEMY_SIZE_SM));
}
