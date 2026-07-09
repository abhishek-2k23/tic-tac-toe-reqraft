import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('Next player: X');

  useEffect(() => {
    socket.on('gameState', (gameState) => {
      setGrid(gameState.grid);
      setIsXNext(gameState.isXNext);
      setStatus(`Next player: ${gameState.isXNext ? 'X' : 'O'}`);
    });
    socket.on('gameEnd', ({ winner, isDraw }) => {
      setStatus(
        winner
          ? `Winner: ${winner}`
          : isDraw
          ? 'The game is a draw!'
          : status
      );
      setTimeout(() => {
        socket.emit('reset');
      }, 2000); // 2-second delay before reset
    });
    socket.on('reset', () => {
      setGrid(Array(9).fill(null));
      setStatus('Next player: X');
    });
  }, []);

  const handleClick = (index) => {
    socket.emit('play', index);
  };

  return (
    <div className="game">
      <div className="game-board">
        {grid.map((value, index) => (
          <button
            key={index}
            className="square"
            onClick={() => handleClick(index)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="game-info">
        <div>{status}</div>
      </div>
    </div>
  );
}

export default App;
