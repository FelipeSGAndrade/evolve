(function() {

  const defaultColor = '#FFFFFF'
  const defaultFont = '20px Arial'
  const defaultFontColor = '#000'

  function Button({label, color, font, fontColor, onClick}) {
  	this.Container_constructor()

  	this.color = color || defaultColor
    this.font = font || defaultFont
    this.fontColor = fontColor || defaultFontColor
  	this.label = label
    this.onClick = onClick

  	this.setup()
  }
  var p = createjs.extend(Button, createjs.Container)

  p.setup = function() {
  	var text = new createjs.Text(this.label, this.font, this.fontColor)
  	text.textBaseline = "top"
  	text.textAlign = "center"

  	var width = text.getMeasuredWidth()+30
  	var height = text.getMeasuredHeight()+20

  	text.x = width/2
  	text.y = 10

  	var background = new createjs.Shape()
  	background.graphics
      .beginStroke('#000')
      .beginFill(this.color)
      .drawRoundRect(0,0,width,height,10)

  	this.addChild(background, text)
  	this.on("click", this.handleClick)
  	this.on("rollover", this.handleRollOver)
  	this.on("rollout", this.handleRollOver)
  	this.cursor = "pointer"

  	this.mouseChildren = false

  	this.offset = Math.random()*10
  }

  p.handleClick = function (event) {
    this.onClick(event)
  }

  p.handleRollOver = function(event) {
  	this.alpha = event.type == "rollover" ? 0.4 : 1
  }

  window.Button = createjs.promote(Button, "Container")
}())
