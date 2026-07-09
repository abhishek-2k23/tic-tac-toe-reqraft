const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameState = {
  grid: Array(9).fill(null),
  isXNext: true,
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const checkForDraw = (squares) => squares.every(Boolean);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('gameState', gameState);

  socket.on('play', (index) => {
    if (gameState.grid[index] || calculateWinner(gameState.grid)) return;
    gameState.grid[index] = gameState.isXNext ? 'X' : 'O';
    gameState.isXNext = !gameState.isXNext;
    const winner = calculateWinner(gameState.grid);
    if (winner || checkForDraw(gameState.grid)) {
      io.emit('gameEnd', { winner, isDraw: !winner });
      gameState.grid = Array(9).fill(null);
      gameState.isXNext = true;
      io.emit('gameState', gameState);
    } else {
      io.emit('gameState', gameState);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Server running on http://localhost:4000'));