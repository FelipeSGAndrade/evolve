'use strict'

let stage
let context2D
let map
let gameRegion
let baseFPS = 20
let screenMargin = 20
let margin = 10

let creatureList = []

let geneticManager
let hitTest

function initialize() {
    stage = new createjs.Stage("gameCanvas")
    stage.enableMouseOver()
    stage.canvas.width = window.innerWidth - screenMargin
    stage.canvas.height = window.innerHeight - screenMargin
    stage.width = 1000
    stage.height = 1000

    context2D = stage.canvas.getContext('2d')

    gameRegion = new createjs.Container()
    gameRegion.width = stage.width
    gameRegion.height = stage.height
    stage.addChild(gameRegion)

    hitTest = new createjs.Shape()
    hitTest.graphics
        .beginStroke("White")
        .beginFill("Blue")
        .drawCircle(0, 0, 5)
        .command
    
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

    generateCreatures(gameRegion, 100)

    gameRegion.addChild(hitTest)

    createjs.Ticker.setFPS(baseFPS)
    createjs.Ticker.on("tick", handleUpdate)
}

function handleUpdate(event) {
    stage.update(event)
}

function generateCreatures(parent, qtd) {
    for(let i = 0; i < qtd; i++) {
        const color = colors[MathHelper.randomInt(0, colors.length)]
        const x = MathHelper.randomIntInclusive(0, parent.width - margin)
        const y = MathHelper.randomIntInclusive(0, parent.height - margin)
        const creature = new Creature({color, x, y})
        parent.addChild(creature)
        creatureList.push(creature)
    }
}

function getMapPosition(x, y) {
    const clampedX = MathHelper.clamp(x, 1, gameRegion.width - 1)
    const clampedY = MathHelper.clamp(y, 1, gameRegion.height - 1)
    return map.getMapPosition(clampedX, clampedY)
}

function eatFood(x, y, ammount) {
    return map.eatTileFood(x, y, ammount)
}

function getRGBA(x, y) {
    return context2D.getImageData(x, y, 1, 1).data
}

function creatureHitTest(id, x, y) {
    // hitTest.x = x
    // hitTest.y = y
    for(let i = 0; i < creatureList.length; i++) {
        const creature = creatureList[i]
        if (creature.id !== id && creature.basicHitTest(x, y)) { 
            return creature
        }
    }

    return null
}

const colors = [
    "rgb(255, 255, 255)",
    // "rgb(255, 0, 0)",
    "rgb(0, 0, 255)",
    "rgb(0, 255, 0)",
    "rgb(124, 0, 124)",
    "rgb(255, 124, 255)",
    "rgb(0, 0, 0)"
]

window.onload = initialize
