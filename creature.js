'use strict';

(function() {

    const maxEnergy = 400
    const minEnergy = 1
    const turnVelocity = 20
    const maxVelocity = 10
    let uniqueId = 0

    const maxRadius = 40
    const minRadius = 4
    const energyToRadius = 1/5

    const energyPerSecond = 2
    const energyToEat = 1
    const energyToMove = 1
    const energyToBreed = maxEnergy/2

    const ammountToEat = 2

    const minEnergyToBreed = energyToBreed
    const energyPassed = energyToBreed/2

    function Creature(options) {
        this.Container_constructor()

        options = options || {}
        this.color = options.color || "Black"
        this.energy = options.energy || 100
        this.x = options.x || 100
        this.y = options.y || 100

        this.id = uniqueId++
        this.alive = true
        this.velocity = 10
        this.actionPointDistance = 10

        this.setup(options.flatWeights)
    }

    const p = createjs.extend(Creature, createjs.Container)

    p.setup = function(flatWeights) {
        if(this.id === 1) this.color = "rgb(255,0,0)"
        const body = new createjs.Shape()
        this.bodyCommand = body.graphics
            .setStrokeStyle(2)
            .beginStroke("Black")
            .beginFill(this.color)
            .drawCircle(0, 0, this.getRadius())
            .command

        this.headCommand = body.graphics
            .beginFill(this.color)
            .drawCircle(0, 0, 5)
            .command

        this.addChild(body)
        this.cursor = "pointer"

        const log = false
        this.neuralNetwork = CreateNeuralNetwork({flatWeights, log})

        this.on("click", this.handleClick)
        this.on("tick", this.tick)
    }

    p.getRadius = function() {
        return MathHelper.clamp(this.energy * energyToRadius, minRadius, maxRadius)
    }

    p.getGenes = function() {
        return this.neuralNetwork.getFlatWeights()
    }

    p.handleClick = function() {
        const globalActionPoint = this.getActionPointCoordinates()
        const mapInfo = JSON.stringify(getMapPosition(this.x, this.y))
        const actionInfo = JSON.stringify(this.actionPointDistance)
        const globalActionInfo = JSON.stringify(globalActionPoint)
        const actionMapInfo = JSON.stringify(getMapPosition(globalActionPoint.x, globalActionPoint.y))
        const vision = JSON.stringify(this.getVision())

        let consoleText = 'creatureId: ' + this.id
        consoleText += '\ncreature energy: ' + this.energy
        consoleText += '\nrotation: ' + this.rotation
        consoleText += `\nx: ${this.x} y: ${this.y}`
        consoleText += '\naction: ' + actionInfo
        consoleText += '\nglobalAction: ' + globalActionInfo
        consoleText += '\nmapInfo: ' + mapInfo
        consoleText += '\nactionMapInfo: ' + actionMapInfo
        consoleText += '\nvision: ' + vision

        console.log(consoleText)
    }

    p.tick = function() {
        const value = energyPerSecond/baseFPS
        this.consumeEnergy(value)

        const inputs = this.getInputs()
        const outputs = this.neuralNetwork.processInputs(inputs)
        this.processOutput(outputs)
        this.breed()

        if (!this.alive) this.die()
    }

    p.getActionPointCoordinates = function () {
        const forward = MathHelper.forward(this.rotation)
        return {
            x: this.x + forward.x * this.actionPointDistance,
            y: this.y + forward.y * this.actionPointDistance
        }
    }

    p.getInputs = function() {
        const vision = this.getVision()

        return [
            this.energy,
            this.rotation,
            vision.r,
            vision.g,
            vision.b
        ]
    }

    p.basicHitTest = function (x, y) {
        const x1 = this.x - this.getRadius()
        const x2 = this.x + this.getRadius()
        const y1 = this.y - this.getRadius()
        const y2 = this.y + this.getRadius()
        return (x > x1 && x < x2) && (y > y1 && y < y2)
    }

    p.getColor = function() {
        const match = this.color.match(/(\d+),\s?(\d+),\s?(\d+)/)
        if (match && match.length === 4) return match.slice(1, 4)
        
        return [0, 0, 0]
    }

    p.getVision = function() {
        const pos = this.getActionPointCoordinates()
        let colors = [0, 0, 0]
        let type = null
        let object = null

        const creature = creatureHitTest(this.id, pos.x, pos.y)
        if(creature) {
            type = 'creature'
            colors = creature.getColor()
            object = creature
        }
        else {
            const tileInfo = getMapPosition(pos.x, pos.y)
            type = 'tile'
            colors = tileInfo.color
            object = tileInfo
        }

        return {
            type,
            object,
            r: colors[0],
            g: colors[1],
            b: colors[2]
        }
    }

    p.consumeEnergy = function(value) {
        const newEnergy = this.energy - value
        if(newEnergy <= minEnergy) {
            this.shouldDie()
        }

        this.setEnergy(newEnergy)
        return true
    }

    p.increaseEnergy = function(value) {
        let newEnergy = this.energy + value
        if(newEnergy >= maxEnergy) {
            newEnergy = maxEnergy
        }

        this.setEnergy(newEnergy)
    }

    p.setEnergy = function(newEnergy) {
        this.energy = newEnergy
        this.bodyCommand.radius = this.getRadius()
        this.headCommand.x = this.getRadius()
        this.actionPointDistance = this.headCommand.x + 10 
    }

    p.eat = function() {
        const pos = this.getActionPointCoordinates()
        const mapPosition = getMapPosition(pos.x, pos.y)
        const ammountEaten = eatFood(mapPosition.mapX, mapPosition.mapY, 20)

        if (ammountEaten > 0) {
            this.increaseEnergy(ammountEaten)
            this.consumeEnergy(energyToEat)
        }
    }

    p.shouldDie = function() {
        this.alive = false
    }

    p.die = function() {
        this.parent.removeChild(this)
    }

    p.randomCommands = function(chances) {
        const commands = []

        for (let i = 0; i < chances.length; i++) {
            commands.push(MathHelper.randomIntInclusive(0, chances[i]) === 1)
        }

        return commands
    }

    p.processOutput = function(outputs) {
        if (outputs.length !== 7)
            throw new Error('Invalid output length')

        const velocityMultiplier = outputs[5]
        this.shouldBread = (outputs[6] > 0.5)

        if (outputs[0] > 0.5) this.turnRight()
        if (outputs[1] > 0.5) this.turnLeft()
        if (outputs[2] > 0.5) this.forward(velocityMultiplier)
        if (outputs[3] > 0.5) this.backward(velocityMultiplier)
        if (outputs[4] > 0.5) this.eat()

        return true
    }

    p.turnRight = function() {
        this.rotation += turnVelocity
    }

    p.turnLeft = function() {
        this.rotation -= turnVelocity
    }

    p.forward = function(velocityMultiplier) {
        const forward = MathHelper.forward(this.rotation)
        this.consumeEnergy(velocityMultiplier * energyToMove)
        this.accelerate(forward, maxVelocity * velocityMultiplier)
    }

    p.backward = function(velocityMultiplier) {
        const backward = MathHelper.backward(this.rotation)
        this.consumeEnergy(velocityMultiplier * energyToMove)
        this.accelerate(backward, (maxVelocity * velocityMultiplier)/2)
    }

    p.accelerate = function(vector, vel) {
        let nextPlayerX = this.x + vector.x * vel
        let nextPlayerY = this.y + vector.y * vel

        nextPlayerX = MathHelper.clamp(nextPlayerX, 2, this.parent.width - 2)
        nextPlayerY = MathHelper.clamp(nextPlayerY, 2, this.parent.height - 2)

        return this.move(nextPlayerX, nextPlayerY)
    }

    p.move = function(nextX, nextY) {
        if (nextX === this.x && nextY === this.y) return false

        this.x = nextX
        this.y = nextY
        return true
    }

    p.breed = function() {
        if(!this.shouldBread) return
        this.shouldBread = false

        if(this.energy < minEnergyToBreed) return
        this.consumeEnergy(energyToBreed)

        const vision = this.getVision()
        if (vision.type !== 'creature') {
            divide(this, energyPassed)
        }
        else {
            reproduce(this, vision.object, energyPassed)
        }
    }

    window.Creature = createjs.promote(Creature, "Container")
}())
