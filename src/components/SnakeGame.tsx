import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIR = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

const SAVED_GAME_KEY = 'synthSnakeGameState';
const HIGH_SCORE_KEY = 'synthSnakeHighScore';

const loadInitialGameState = () => {
  try {
    const saved = localStorage.getItem(SAVED_GAME_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.isGameOver) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse saved game", e);
  }
  return null;
};

export default function SnakeGame() {
  const [savedState] = useState(() => loadInitialGameState());
  
  const [snake, setSnake] = useState<Point[]>(savedState?.snake || INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(savedState?.direction || INITIAL_DIR);
  const [food, setFood] = useState<Point>(savedState?.food || { x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(savedState?.score || 0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(!!savedState);
  
  const directionRef = useRef<Point>(savedState?.direction || INITIAL_DIR);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Make sure food doesn't spawn on the snake
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    setFood(newFood);
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIR);
    directionRef.current = INITIAL_DIR;
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setHasSavedGame(false);
    generateFood(INITIAL_SNAKE);
  };

  const endGame = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  useEffect(() => {
    localStorage.setItem(HIGH_SCORE_KEY, highScore.toString());
  }, [highScore]);

  useEffect(() => {
    if (isPlaying || isGameOver || score > 0) {
      localStorage.setItem(SAVED_GAME_KEY, JSON.stringify({
        snake,
        direction: directionRef.current,
        food,
        score,
        isGameOver
      }));
    }
  }, [snake, food, score, isGameOver, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      const currentDir = directionRef.current;

      if (isPlaying && e.key === ' ') {
        setIsPlaying(false); // Pause
        return;
      }

      if (!isPlaying && !isGameOver && e.key === ' ') {
        if (hasSavedGame || score > 0 || snake.length > INITIAL_SNAKE.length) {
          setIsPlaying(true);
          setHasSavedGame(false);
        } else {
          startGame();
        }
        return;
      }
      if (isGameOver && e.key === ' ') {
        startGame();
        return;
      }

      if (isGameOver) return; // Prevent direction change if dead

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, score, highScore, hasSavedGame, snake.length]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          endGame();
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          endGame();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, food, score, generateFood]);

  return (
    <div className="flex flex-col items-center p-6 bg-slate-900 border border-slate-700/50 rounded-2xl neon-box-cyan w-full max-w-md mx-auto">
      
      {/* Header / Score */}
      <div className="w-full flex justify-between items-center mb-6 px-2 text-slate-300 font-orbitron tracking-wider">
        <div className="flex flex-col">
          <span className="text-xs uppercase text-cyan-400">Score</span>
          <span className="text-2xl font-bold neon-text-cyan">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs uppercase flex items-center justify-end gap-1 text-pink-400">
            <Trophy className="w-3 h-3" /> Hi-Score
          </span>
          <span className="text-2xl font-bold text-pink-500 neon-text-pink">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className="relative bg-slate-950 border-2 border-cyan-500/50 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] rounded"
        style={{
          width: '100%',
          maxWidth: '350px',
          aspectRatio: '1/1',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gap: '1px'
        }}
      >
        {/* Render Grid cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          
          const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
          const isFood = food.x === x && food.y === y;
          const isHead = snake[0].x === x && snake[0].y === y;
          
          return (
            <div
              key={i}
              className={`
                flex items-center justify-center
                ${isHead ? 'bg-cyan-300 neon-box-cyan rounded-sm z-10' : ''}
                ${isSnake && !isHead ? 'bg-cyan-500/80 rounded-sm' : ''}
                ${isFood ? 'bg-pink-500 neon-box-pink rounded-full animate-pulse' : ''}
              `}
            />
          );
        })}

        {/* Overlays */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
            <Play className="w-12 h-12 text-cyan-400 mb-4 animate-bounce" />
            <p className="font-orbitron font-bold text-cyan-400 text-lg neon-text-cyan">
              {hasSavedGame || score > 0 ? "PAUSED" : "READY?"}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {hasSavedGame || score > 0 ? "Press SPACE to Resume" : "Press SPACE to Start"}
            </p>
            <p className="text-slate-500 text-xs mt-1">Use WASD or Arrows to move</p>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
            <p className="font-orbitron font-bold text-pink-500 text-2xl neon-text-pink mb-2">SYSTEM FAILURE</p>
            <p className="text-slate-300 text-sm mb-6 uppercase tracking-widest">Final Score: {score}</p>
            <button 
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 transition-colors rounded font-orbitron font-bold uppercase tracking-widest text-slate-950"
            >
              <RotateCcw className="w-5 h-5" />
              Reboot Let\'s Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
