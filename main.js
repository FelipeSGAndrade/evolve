'use strict'

let baseFPS = 60
let updateRatio = 2
let updateCount = updateRatio
let currentFPS = baseFPS

let stage
let gameView
let menuView
let gameRegion
let map

let screenMargin = 20
let margin = 10

const menuViewWidth = 300

const mapTilesWidth = 100
const mapTilesHeight = 100
const gameRegionWidth = mapTilesWidth * 30
const gameRegionHeight = mapTilesHeight * 30

let creatureList = []
let deadCreatureList = []

let geneticManager
let hitTest

function initialize() {

    stage = new createjs.Stage("gameCanvas")
    stage.enableMouseOver()

    menuView = new Menu()
    stage.addChild(menuView)

    gameView = new createjs.Container()
    stage.addChild(gameView)

    resize()

    gameRegion = new createjs.Container()
    gameRegion.width = gameRegionWidth
    gameRegion.height = gameRegionHeight
    gameView.addChild(gameRegion)

    hitTest = new createjs.Shape()
    hitTest.graphics
        .beginStroke("White")
        .beginFill("Blue")
        .drawCircle(0, 0, 5)
        .command

    const mapOptions = {
        mapWidth: mapTilesWidth,
        mapHeight: mapTilesHeight,
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
        let minX = gameView.width - gameRegion.width
        if (minX > 0) minX = 0
        const maxX = 0
        let minY = gameView.height - gameRegion.height
        if (minY > 0) minY = 0
        const maxY = 0

        gameRegion.x = MathHelper.clamp(gameRegion.x + event.stageX - map.dragLastX, minX, maxX)
        gameRegion.y = MathHelper.clamp(gameRegion.y + event.stageY - map.dragLastY, minY, maxY)

        map.dragLastX = event.stageX
        map.dragLastY = event.stageY
    })

    generateCreatures(100)

    gameRegion.addChild(hitTest)

    createjs.Ticker.setFPS(baseFPS)
    createjs.Ticker.on("tick", handleUpdate)
}

function resize() {
    const canvas = stage.canvas
    canvas.width = window.innerWidth - screenMargin
    canvas.height = window.innerHeight - screenMargin

    menuView.x = canvas.width - menuViewWidth
    menuView.width = menuViewWidth
    menuView.height = canvas.height

    gameView.width = canvas.width - menuViewWidth
    gameView.height = canvas.height

    var maskShape = new createjs.Shape()
    maskShape.graphics.drawRect(0, 0, gameView.width, gameView.height).command
    gameView.mask = maskShape
}

function handleUpdate(event) {
    updateCount++
    currentFPS = createjs.Ticker.getMeasuredFPS().toFixed(0)

    if (updateCount >= updateRatio) {
        stage.update(event)
        updateCount = 0
    }
    else
        partialUpdate()

    if(creatureList.length < 10)
      generateCreatures(1)
}

function partialUpdate() {
    map.tick()
    creatureList.forEach((creature) => creature.tick())
}

function generateCreatures(qtd) {
    for(let i = 0; i < qtd; i++) {
        const x = MathHelper.randomIntInclusive(0, gameRegion.width - margin)
        const y = MathHelper.randomIntInclusive(0, gameRegion.height - margin)
        hatchCreature({x, y})
    }
}

function hatchCreature(options) {
    let creature
    if(deadCreatureList.length > 0) {
        creature = deadCreatureList.pop()
        creature.config(options)
    }
    else {
        creature = new Creature(options)
    }

    gameRegion.addChild(creature)
    creatureList.push(creature)
}

function getMapPosition(x, y) {
    const clampedX = MathHelper.clamp(x, 1, gameRegion.width - 1)
    const clampedY = MathHelper.clamp(y, 1, gameRegion.height - 1)
    return map.getMapPosition(clampedX, clampedY)
}

function eatFood(x, y, ammount) {
    return map.eatTileFood(x, y, ammount)
}

function creatureHitTest(id, x, y) {
    for(let i = 0; i < creatureList.length; i++) {
        const creature = creatureList[i]
        if (creature.id !== id && creature.basicHitTest(x, y)) {
            return creature
        }
    }

    return null
}

function reproduce(creature1, creature2, energy) {
    const genes = Genetics.reproduce(creature1.getGenes(), creature2.getGenes())

    const x = (creature1.x + creature2.x) / 2
    const y = (creature1.y + creature2.y) / 2
    const creature = new Creature({x, y, energy, genes})
    hatchCreature({x, y, energy, genes})
}

function divide(creature1, energy) {
    const genes = Genetics.divide(creature1.getGenes())

    const x = creature1.x
    const y = creature1.y
    hatchCreature({x, y, energy, genes})
}

function fpsUp() {
    setFps(baseFPS + 10)
}

function fpsDown() {
    setFps(baseFPS - 10)
}

function maxFps() {
    setFps(600)
}

function minFps() {
    setFps(10)
}

function setFps(n) {
    if(n < 10) return
    baseFPS = n
    updateRatio = Math.floor(baseFPS/30)
    createjs.Ticker.setFPS(baseFPS)
}

function removeCreature(creature) {
    const index = creatureList.indexOf(creature)
    creatureList.splice(index, 1)
    deadCreatureList.push(creature)

    gameRegion.removeChild(creature)
}

window.onload = initialize
window.addEventListener('resize', resize, false)
