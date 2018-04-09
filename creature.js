(function() {

    function Creature(options) {
        this.Container_constructor()
        this.color = options.color || "Black"
        this.energy = options.energy || 10
        this.x = options.x || 100
        this.y = options.y || 100

        this.setup()
    }

    const p = createjs.extend(Creature, createjs.Container)

    p.setup = function() {
        const body = new createjs.Shape()
        body.graphics
            .setStrokeStyle(2)
            .beginStroke("Black")
            .beginFill(this.color)
            .drawCircle(0, 0, this.energy)

        this.addChild(body)
        this.cursor = "pointer"

        body.on("click", () => alert(`creature energy: ${this.energy}\nx: ${this.x} y: ${this.y}\nmapInfo: ${JSON.stringify(getMapPosition(this.x, this.y))}`))
    }

    window.Creature = createjs.promote(Creature, "Container")
}())