'use strict';

(function() {

    const maxEnergy = 400
    const minEnergy = 1
    const turnVelocity = 20
    const maxVelocity = 10
    let uniqueId = 0

    const maxRadius = 40
    const minRadius = 5
    const energyToRadius = 1/5
    const creatureMargin = 10

    const energyPerSecond = 2
    const energyToMove = 0.1
    const energyToTurn = 0.5

    const energyToEat = 1
    const ammountToEat = 3

    const energyToBreed = 50
    const minEnergyToBreed = energyToBreed * 2
    const energyPassed = energyToBreed

    function Creature(options) {
        this.Container_constructor()

        options = options || {}
        this.energy = options.energy || 100
        this.x = options.x || 100
        this.y = options.y || 100

        this.id = uniqueId++
        this.alive = true
        this.velocity = 10
        this.actionPointDistance = 10
        this.movementBlocked = 0

        this.processGenes(options.genes)

        this.on("added", this.setup)
    }

    const p = createjs.extend(Creature, createjs.Container)

    p.processGenes = function(genes) {

        let colorArray = []
        if (!genes || genes.length === 0)
            colorArray = [MathHelper.randomIntInclusive(0, 255), MathHelper.randomIntInclusive(0, 255), MathHelper.randomIntInclusive(0, 255)]
        else
            colorArray = genes.splice(0,3)

        this.color = `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`

        if(!genes || genes.length === 0)
            this.flatWeights = null
        else
            this.flatWeights = genes
    }

    p.setup = function() {

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
        this.neuralNetwork = CreateNeuralNetwork({flatWeights: this.flatWeights, log})

        this.on("click", this.handleClick)
        this.on("tick", this.tick)
    }

    p.getRadius = function() {
        return MathHelper.clamp(this.energy * energyToRadius, minRadius, maxRadius)
    }

    p.getGenes = function() {
        const colorArray = this.getColor()
        return colorArray.concat(this.neuralNetwork.getFlatWeights())
    }

    p.handleClick = function() {
        const globalActionPoint = this.getActionPointCoordinates()
        const mapInfo = JSON.stringify(getMapPosition(this.x, this.y))
        const actionInfo = JSON.stringify(this.actionPointDistance)
        const globalActionInfo = JSON.stringify(globalActionPoint)
        const actionMapInfo = JSON.stringify(getMapPosition(globalActionPoint.x, globalActionPoint.y))
        const vision = this.getVision().type

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
        if(!this.alive) return

        const value = energyPerSecond/baseFPS
        this.consumeEnergy(value)

        this.maxMovementX = this.parent.width - this.getRadius() - creatureMargin
        this.minMovementX = this.getRadius() + creatureMargin
        this.maxMovementY = this.parent.height - this.getRadius() - creatureMargin
        this.minMovementY = this.getRadius() + creatureMargin

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
            this.movementBlocked,
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
        const ammountEaten = eatFood(mapPosition.mapX, mapPosition.mapY, ammountToEat)

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
        if (outputs.length !== 8)
            throw new Error('Invalid output length')

        const velocityMultiplier = outputs[5]
        this.shouldBreed = (outputs[6] > 0.5)
        this.willingToBreed = (outputs[7] > 0.5)

        if (outputs[4] > 0.5) this.eat()
        if (outputs[0] > 0.5) this.turnRight()
        if (outputs[1] > 0.5) this.turnLeft()
        if (outputs[2] > 0.5) this.forward(velocityMultiplier)
        if (outputs[3] > 0.5) this.backward(velocityMultiplier)

        return true
    }

    p.turnRight = function() {
        this.rotation += turnVelocity
        this.consumeEnergy(energyToTurn)
    }

    p.turnLeft = function() {
        this.rotation -= turnVelocity
        this.consumeEnergy(energyToTurn)
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

        if (nextPlayerX >= this.maxMovementX || nextPlayerX <= this.minMovementX
            || nextPlayerY >= this.maxMovementY || nextPlayerY <= this.minMovementY) {

            this.movementBlocked = 1
            nextPlayerX = MathHelper.clamp(nextPlayerX, this.minMovementX, this.maxMovementX)
            nextPlayerY = MathHelper.clamp(nextPlayerY, this.minMovementY, this.maxMovementY)
        }
        else this.movementBlocked = 0

        return this.move(nextPlayerX, nextPlayerY)
    }

    p.move = function(nextX, nextY) {
        if (nextX === this.x && nextY === this.y) return false

        this.x = nextX
        this.y = nextY
        return true
    }

    p.canBreed = function() {
      return this.energy >= minEnergyToBreed
    }

    p.isWillingToBreed = function() {
      return this.willingToBreed && this.energy >= minEnergyToBreed
    }

    p.breed = function() {
        if(!this.shouldBreed) return
        this.shouldBreed = false

        if(!this.canBreed()) return

        const vision = this.getVision()
        if (vision.type !== 'creature') {
            this.consumeEnergy(energyToBreed)
            divide(this, energyPassed)
        }
        else {
            const secondCreature = vision.object
            if (secondCreature.isWillingToBreed()) {
              secondCreature.consumeEnergy(energyToBreed/2)
              this.consumeEnergy(energyToBreed/2)
              reproduce(this, secondCreature, energyPassed)
            }
        }
    }

    window.Creature = createjs.promote(Creature, "Container")
}())
