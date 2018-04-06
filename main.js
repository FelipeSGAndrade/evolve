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

    const map = new createjs.Container()
    map.width = stage.width
    map.height = stage.height
    stage.addChild(map)

    const dragable = new createjs.Shape()
    dragable.graphics
        .setStrokeStyle(2)
        .beginStroke("Black")
        .beginFill("White")
        .drawRect(0, 0, map.width, map.height)
    map.addChild(dragable)
    
    dragable.on("mousedown", function(event) {
        dragable.dragLastX = event.stageX
        dragable.dragLastY = event.stageY
    })

    dragable.on("pressmove", function(event) {
        let minX = - (map.width - stage.canvas.width)
        if (minX > 0) minX = 0
        const maxX = 0
        let minY = - (map.height - stage.canvas.height)
        if (minY > 0) minY = 0
        const maxY = 0

        map.x = MathHelper.clamp(map.x + event.stageX - dragable.dragLastX, minX, maxX)
        map.y = MathHelper.clamp(map.y + event.stageY - dragable.dragLastY, minY, maxY)

        dragable.dragLastX = event.stageX
        dragable.dragLastY = event.stageY
    })

    generateCreatures(map, 10)

    createjs.Ticker.on("tick", handleUpdate)
}

function handleUpdate() {
    stage.update()
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
