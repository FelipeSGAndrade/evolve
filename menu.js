(function() {

    const textMargin = 10
    const textFont = '20px Arial'
    const ySpacing = 10
    let nextHeight = textMargin

    function Menu() {
        this.Container_constructor()

        const fpsControlOptions = {
            label: 'FPS',
            infoFunction: this.getFPSInfo,
            btns: ['newLine',
            {
                label: '+',
                font: textFont,
                onClick: fpsUp
            },{
                label: '-',
                font: textFont,
                onClick: fpsDown
            },
            'newLine',
            {
              label: 'max',
              font: textFont,
              onClick: maxFps
            },{
              label: 'min',
              font: textFont,
              onClick: minFps
            }]
        }

        this.fpsControl = new MenuItem(fpsControlOptions)
        this.fpsControl.x = textMargin

        this.populationInfo = new MenuItem({label: 'Creatures', infoFunction: () => creatureList.length}, textFont)
        this.populationInfo.x = textMargin

        this.reserveInfo = new MenuItem({label: 'Reserve', infoFunction: () => deadCreatureList.length}, textFont)
        this.reserveInfo.x = textMargin

        this.addChild(this.fpsControl, this.populationInfo, this.reserveInfo)
        this.on('tick', this.tick)
    }

    const p = createjs.extend(Menu, createjs.Container)

    p.tick = function() {
        this.populationInfo.text = 'Creatures: ' + creatureList.length
    }

    p.getFPSInfo = function() {
        return `${currentFPS}/${baseFPS}/${updateRatio}`
    }

    p.addChild = function(...children) {
        children.forEach((child) =>{
            child.y = nextHeight
            this.Container_addChild(child)

            nextHeight += child.getBounds().height + ySpacing
        })
    }

    window.Menu = createjs.promote(Menu, "Container")
}())
