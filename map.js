(function() {

    function Map(options) {
        this.Container_constructor()

        options = options || {}
        this.mapHeight = options.mapHeight || 10
        this.mapWidth = options.mapWidth || 10
        this.regionHeight = options.regionHeight || 100
        this.regionWidth = options.regionWidth || 100
        this.fertility = 1
        this.updateCount = 0

        this.setup()
    }

    const p = createjs.extend(Map, createjs.Container)

    p.setup = function() {
        this.tileHeight = this.regionHeight / this.mapHeight
        this.tileWidth = this.regionWidth / this.mapWidth
        this.map = []
        this.tileCommands = []

        for (let i = 0; i < this.mapHeight; i++) {
            const row = []
            const rowTileCommands = []

            for (let j = 0; j < this.mapWidth; j++) {
                const value = MathHelper.randomInt(0, 100)
                row.push(value)

                const x = j * this.tileWidth
                const y = i * this.tileHeight

                const tile = new createjs.Shape()
                const fillCommand = tile.graphics
                    .beginFill(`rgb(10, ${value}, 10)`).command
                rowTileCommands.push(fillCommand)

                tile.graphics
                    .drawRect(x, y, this.tileWidth, this.tileHeight)

                fillCommand.lastUpdateCount = 0

                this.addChild(tile)
            }

            this.map.push(row)
            this.tileCommands.push(rowTileCommands)
        }

        this.on("tick", this.tick)
    }

    p.getMapPosition = function(x, y) {
        const mapX = Math.floor(x / this.tileWidth)
        const mapY = Math.floor(y / this.tileHeight)

        this.updateTileFood(mapX, mapY)

        return {
            mapX: mapX,
            mapY: mapY,
            food: this.map[mapY][mapX],
            color: this.getTileColor(mapX, mapY)
        }
    }

    p.updateTileFood = function(mapX, mapY) {
        const tile = this.tileCommands[mapY][mapX]

        const difference = this.updateCount - tile.lastUpdateCount
        if(difference <= 0) return

        const ammount = difference * (this.fertility/60)
        this.increaseFood(mapX, mapY, ammount)
        tile.lastUpdateCount = this.updateCount
    }

    p.getTileColor = function(mapX, mapY) {
        const tileStyle = this.tileCommands[mapY][mapX].style
        const match = tileStyle.match(/(\d+),\s?(\d+),\s?(\d+)/)
        if (match && match.length === 4) return match.slice(1, 4)

        return [0, 0, 0]
    }

    p.eatTileFood = function(x, y, ammount) {
        if(this.map[y][x] < 1) return 0

        let newFood = Math.floor(this.map[y][x] - ammount)
        let ammountEaten = ammount
        if(newFood < 0) {
            newFood = 0
            ammountEaten = this.map[y][x]
        }

        this.setTileFood(x, y, newFood)

        return ammountEaten
    }

    p.increaseFood = function(x, y, ammount) {
        if(this.map[y][x] >= 255) return

        let newFood = this.map[y][x] + ammount
        if(newFood > 255) {
            newFood = 255
        }

        this.setTileFood(x, y, newFood)
    }

    p.setTileFood = function(x, y, newFood) {
        this.map[y][x] = newFood
        this.tileCommands[y][x].style = `rgb(10, ${Math.floor(newFood)}, 10)`
    }

    p.tick = function() {
        this.updateCount++
    //     const value = this.fertility/60
    //     for (let i = 0; i < this.mapHeight; i++) {
    //         for (let j = 0; j < this.mapWidth; j++) {
    //             this.increaseFood(j, i, value)
    //         }
    //     }
    }

    window.Map = createjs.promote(Map, "Container")
}())
