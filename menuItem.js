(function() {

    const textFont = '20px Times new roman'
    const xSpacing = 5
    const ySpacing = 10

    function MenuItem({label, infoFunction, btns}) {
        this.Container_constructor()

        this.label = label
        this.infoFunction = infoFunction

        this.label = new createjs.Text(label + ':', textFont)
        this.info = new createjs.Text(infoFunction? infoFunction() : '', textFont)
        this.info.x = this.label.getMeasuredWidth() + xSpacing

        this.addChild(this.label, this.info)

        let nextY = 0

        this.btns = []
        btns = btns || []
        btns.forEach((options) => {
            if (options === 'newLine') {
                this.btns.push(options)
                nextY = this.getBounds().height + ySpacing
                return
            }

            const btn = new Button(options)
            btn.y = nextY
            this.btns.push(btn)
            this.addChild(btn)
        })

        this.on('tick', this.tick)
    }

    const p = createjs.extend(MenuItem, createjs.Container)

    p.tick = function() {
        if (this.infoFunction) this.info.text = this.infoFunction()

        let nextX = this.info.x + this.info.getMeasuredWidth() + xSpacing
        this.btns.forEach((btn) => {
            if (btn === 'newLine') {
                nextX = 0
                return
            }

            btn.x = nextX - btn.getBounds().x
            nextX += btn.getBounds().width + xSpacing
        })
    }

    window.MenuItem = createjs.promote(MenuItem, "Container")
}())
