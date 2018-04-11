"use strict"

const CreateNeuralNetwork = function(flatWeights) {
    let log = false
    let baseTopology = [2, 10, 5]
    let topology = baseTopology
    let activationFunctions = [null, MathHelper.sigmoid, MathHelper.sigmoid]
    let weights = null
    let arestsCount = 0
    let fitness = 0
    const layers = []

    if (flatWeights) {
        if (flatWeights.topology) topology = flatWeights.topology
        if (flatWeights.activationFunctions) activationFunctions = flatWeights.activationFunctions
        if (flatWeights.weights) weights = flatWeights.weights
    }

    if(baseTopology[0] === topology[0]) {
        topology[0]++
    }

    topology.forEach((nodeCount, index) => {
        if (index === 0) return
        const inputCount = topology[index - 1]

        let layerWeights = null
        if (weights) {
            layerWeights = weights.splice(0, inputCount * nodeCount)
            if (layerWeights.length === 0)
                debugger
        }

        arestsCount += inputCount * nodeCount

        layers.push(CreateNeuralLayer(inputCount, nodeCount, activationFunctions[index], layerWeights))
    })

    if (log) console.log("arests count:", arestsCount)

    function processInputs(inputs) {
        if (!inputs.length || inputs.length !== topology[0] - 1) {
            throw new Error('invalid input length')
        }
        inputs.push(1)

        let processed = inputs.slice()
        layers.forEach((layer) => {
            if (log) console.log('input:', processed)
            processed = layer.processInputs(processed)
        })

        if (log) console.log(processed)
        return processed
    }

    function getFlatWeights() {
        const layersWeights = layers.map((layer) => layer.getFlatWeights())
        return [].concat.apply([], layersWeights)
    }

    return {
        set log(bool) {
            log = bool
        },
        topology: topology,
        activationFunctions: activationFunctions,
        arestsCount: arestsCount,
        layers: layers,
        processInputs: processInputs,
        getFlatWeights: getFlatWeights,
        fitness: fitness
    }
}
