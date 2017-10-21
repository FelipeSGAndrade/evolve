'use strict';

const size = 10;
const margin = 20;

let game;
let player;
let playerX = 0;
let playerY = 0;

function clamp(value, min, max) {
  if (value > max) return max;
  else if (value < min) return min;
  return value;
}

function update() {
  //randomCommand();
  const inputs = getInputs();
  console.log(inputs);
  const outputs = NeuralNetwork.processInputs(inputs);

  processOutput(outputs);
  drawPlayer();
}

function drawPlayer() {
  player.style.left = ((playerX * size)) + 'px';
  player.style.top = ((playerY * size)) + 'px';

  if (mapManager.map[playerY][playerX] === 1) player.style.color = 'red';
  else player.style.color = 'black';
}

function getInputs() {
  const inputFirstRow = mapManager.map[playerY].slice();
  let inputSecondRow = [1, 1, 1, 1, 1];
  if(playerY < mapManager.map.length - 1)
    inputSecondRow = mapManager.map[playerY + 1];

  inputFirstRow[playerX] = 2;
  const input = inputFirstRow.concat(inputSecondRow);

  return input.map((value) => value * 5)
}

function processOutput(outputs) {
  if(outputs.length !== 4)
    throw new Error('Invalid output length');

  let command = 0;
  let greater = outputs[0];

  outputs.forEach((output, index) => {
    if(output > greater){
      greater = output;
      command = index;
    }
  });

  switch(command) {
    case 0: right();
      break;

    case 1: left();
      break;

    case 2: up();
      break;

    case 3: down();
      break;
  }
}

function randomCommand() {
  const command = MathHelper.randomInt(0, 4);
  switch(command) {
    case 0: right();
      break;

    case 1: left();
      break;

    case 2: up();
      break;

    case 3: down();
      break;
  }
}

function right() {
  playerX = clamp(playerX + 1, 0, mapManager.mapWidth - 1);
  console.log('right');
}

function left() {
  playerX = clamp(playerX - 1, 0, mapManager.mapWidth - 1);
  console.log('left');
}

function up() {
  playerY = clamp(playerY - 1, 0, mapManager.mapHeight - 1);
  console.log('up');
}

function down() {
  playerY = clamp(playerY + 1, 0, mapManager.mapHeight - 1);
  console.log('down');
}

function initialize() {
  player = document.getElementById('player');

  game = document.getElementById('game');
  game.style.left = margin + 'px';
  game.style.top = margin + 'px';

  mapManager.draw(game, size);
  playerX = mapManager.playerStart[0];
  playerY = mapManager.playerStart[1];

  game.style.height = (mapManager.mapHeight * size) + 'px';
  game.style.width = ((mapManager.mapWidth * size) - 2) + 'px';

  drawPlayer();

  //setInterval(update, 2000)
}

window.onload = initialize;
