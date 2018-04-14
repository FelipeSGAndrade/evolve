(function() {

    const textMargin = 10
    const textFont = '20px Times new roman'
    const ySpacing = 50
    let nextHeight = textMargin

    function Menu() {
        this.Container_constructor()

        this.fpsInfo = new createjs.Text('FPS: ' + baseFPS + '/' + baseFPS, textFont)
        this.fpsInfo.x = textMargin
        this.addChild(this.fpsInfo)

        const btnFpsUpOptions = {
            label: '+',
            font: textFont,
            onClick: fpsUp
        }
        this.btnFpsUp = new Button(btnFpsUpOptions)
        this.btnFpsUp.x = textMargin
        this.addChild(this.btnFpsUp)

        const btnFpsDownOptions = {
            label: '-',
            font: textFont,
            onClick: fpsDown
        }
        this.btnFpsDown = new Button(btnFpsDownOptions)
        this.btnFpsDown.x = textMargin
        this.addChild(this.btnFpsDown)

        this.on('tick', this.tick)
    }

    const p = createjs.extend(Menu, createjs.Container)

    p.tick = function() {
        this.fpsInfo.text = 'FPS: ' + currentFPS + '/' + baseFPS + '/' + updateRatio
    }

    p.addChild = function(child) {
        child.y = nextHeight
        nextHeight += ySpacing
        this.Container_addChild(child)
    }

    window.Menu = createjs.promote(Menu, "Container")
}())
