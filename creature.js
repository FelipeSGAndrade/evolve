(function() {

    const maxEnergy = 200
    const minEnergy = 20
    const turnVelocity = 20
    const maxVelocity = 10
    let uniqueId = 0

    const energyPerSecond = 5
    const energyToEat = 5
    const energyToMove = 1

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
        if(this.id === 1) this.color = "Red"
        const body = new createjs.Shape()
        this.bodyCommand = body.graphics
            .setStrokeStyle(2)
            .beginStroke("Black")
            .beginFill(this.color)
            .drawCircle(0, 0, this.energy)
            .command

        const head = new createjs.Shape()
        this.headCommand = head.graphics
            .setStrokeStyle(2)
            .beginStroke("Black")
            .beginFill(this.color)
            .drawCircle(0, 0, 5)
            .command

        this.addChild(body)
        this.addChild(head)
        this.cursor = "pointer"

        const log = false
        this.neuralNetwork = CreateNeuralNetwork({flatWeights, log})

        this.on("click", this.handleClick)
        this.on("tick", this.tick)
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

    p.getVision = function() {
        const pos = this.getActionPointCoordinates()
        const colors = getRGBA(pos.x, pos.y)
        if(this.id === 1) {
            const objects = stage.getObjectsUnderPoint(pos.x, pos.y)
            console.log(objects)
        }

        return {
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
        this.bodyCommand.radius = this.energy/5
        this.headCommand.x = this.energy/5
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
        if (outputs.length !== 6)
            throw new Error('Invalid output length')

        const velocityMultiplier = outputs[5]
        let validCommand = false
        if (outputs[0] > 0.5) validCommand = this.turnRight()
        if (outputs[1] > 0.5) validCommand = this.turnLeft()
        if (outputs[2] > 0.5) validCommand = this.forward(velocityMultiplier)
        if (outputs[3] > 0.5) validCommand = this.backward(velocityMultiplier)
        if (outputs[4] > 0.5) validCommand = this.eat()

        return validCommand
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

    window.Creature = createjs.promote(Creature, "Container")
}())
