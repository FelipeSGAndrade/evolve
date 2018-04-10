'use strict'

let stage

let gameList = []
let updateInterval
let geneticManager
let gamesX = 5
let gamesY = 200
let updateTime = 1
let drawTreshould = 50
let drawCount = drawTreshould
let screenMargin = 20
let margin = 10
let map = null
let baseFPS = 20

function update() {
    let updated = false
    gameList.forEach((game) => {
        if (game.alive) {
            updated = true
            game.update(drawCount > 10)
        }
    })

    if (!updated) endOfGame()
    else handleUpdate()
}

function endOfGame() {
    const oldFlatNeuralNetworks = gameList.map((game) => {
        // game.clear()

        return {
            weights: game.neuralNetwork.getFlatWeights(),
            fitness: game.neuralNetwork.fitness
        }
    })

    const newFlatNeuralNetworks = geneticManager.process(oldFlatNeuralNetworks)
    startGames(newFlatNeuralNetworks)
}

function createGames() {
    gameList = []

    for (let i = 0; i < gamesY; i++) {
        for (let j = 0; j < gamesX; j++) {
            const draw = (i < 2 && j < 5)
            gameList.push(CreateGame(j, i, 10, 20, draw))
        }
    }
}

function startGames(flatNeuralNetworks) {
    let neuralCount = 0
    flatNeuralNetworks = flatNeuralNetworks || []

    if(drawCount > drawTreshould) drawCount = 0
    else drawCount++

    for (let i = 0; i < gamesY; i++) {
        for (let j = 0; j < gamesX; j++) {
            const neuralNetwork = CreateNeuralNetwork(flatNeuralNetworks[neuralCount] || null)
            gameList[(i * gamesX) + j].startGame(neuralNetwork)
            neuralCount++
        }
    }

    handleUpdate()
}

function initialize() {
    stage = new createjs.Stage("gameCanvas")
    stage.enableMouseOver()
    stage.canvas.width = window.innerWidth - screenMargin
    stage.canvas.height = window.innerHeight - screenMargin
    stage.width = 1000
    stage.height = 1000

    const gameRegion = new createjs.Container()
    gameRegion.width = stage.width
    gameRegion.height = stage.height
    stage.addChild(gameRegion)

    const mapOptions = {
        mapWidth: 20,
        mapHeight: 20,
        regionWidth: gameRegion.width,
        regionHeight: gameRegion.height
    }

    map = new Map(mapOptions)
    gameRegion.addChild(map)
    
    map.on("mousedown", function(event) {
        map.dragLastX = event.stageX
        map.dragLastY = event.stageY
    })

    map.on("pressmove", function(event) {
        let minX = - (gameRegion.width - stage.canvas.width)
        if (minX > 0) minX = 0
        const maxX = 0
        let minY = - (gameRegion.height - stage.canvas.height)
        if (minY > 0) minY = 0
        const maxY = 0

        gameRegion.x = MathHelper.clamp(gameRegion.x + event.stageX - map.dragLastX, minX, maxX)
        gameRegion.y = MathHelper.clamp(gameRegion.y + event.stageY - map.dragLastY, minY, maxY)

        map.dragLastX = event.stageX
        map.dragLastY = event.stageY
    })

    generateCreatures(gameRegion, 10)

    createjs.Ticker.on("tick", handleUpdate)
}

function handleUpdate(event) {
    const fps = createjs.Ticker.getMeasuredFPS()
    stage.update(event, fps)
}

function generateCreatures(parent, qtd) {
    for(let i = 0; i < qtd; i++) {
        const color = colors[MathHelper.randomInt(0, colors.length)]
        const x = MathHelper.randomIntInclusive(0, parent.width - margin)
        const y = MathHelper.randomIntInclusive(0, parent.height - margin)
        const creature = new Creature({color, x, y})
        parent.addChild(creature)
    }
}

function getMapPosition(x, y) {
    return map.getMapPosition(x, y)
}

function eatFood(x, y, ammount) {
    return map.eatTileFood(x, y, ammount)
}

const colors = [
    "White",
    "Red",
    "Blue",
    "Green",
    "Purple",
    "Pink",
    "Black"
]

window.onload = initialize
