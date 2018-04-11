"use strict"

const CreateNeuralLayer = function({inputCount, nodeCount, activationFunction, flatWeights, log}) {

    const weights = []
    for (let i = 0; i < nodeCount; i++) {
        if (flatWeights)
            weights.push(flatWeights.splice(0, inputCount))
        else {
            weights.push([])
            for (let j = 0; j < inputCount; j++)
                weights[i].push(MathHelper.randomInclusive(-1, 1))
        }
    }

    if (log) console.log('weigths:', weights)

    function processInputs(inputs) {
        if (!inputs.length || inputs.length !== inputCount) {
            throw new Error('invalid input length')
        }

        let sum = []
        for (let i = 0; i < nodeCount; i++) {
            sum.push(
                inputs.reduce((last, current, index) => {
                    return last + (current * weights[i][index])
                }, 0)
            )
        }

        if(log) console.log("sum0:",sum[0])
        if(log) console.log("sum0 Sigmoid:", this.activationFunction(sum[0]))

        if (this.activationFunction) {
            return sum.map(this.activationFunction)
        }

        return sum
    }

    const getFlatWeights = () => {
        return [].concat.apply([], weights)
    }

    return {
        set log(bool) {
            log = bool
        },
        inputCount: inputCount,
        nodeCount: nodeCount,
        weights: weights,
        activationFunction: activationFunction || null,
        processInputs: processInputs,
        getFlatWeights: getFlatWeights
    }
}
