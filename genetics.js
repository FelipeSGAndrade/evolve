'use strict'

const CreateGeneticManager = () => {

    const process = (inputGroup) => {

        const parent1 = randomSelection(inputGroup)
        const parent2 = randomSelection(inputGroup)

        const children = crossover(parent1, parent2)

        const survivalGroup = inputGroup.slice(0, inputGroup.length - 2)
        survivalGroup.concat(children)

        return survivalGroup
    }

    const randomSelection = (inputGroup) => {
        return inputGroup[MathHelper.randomInt(0, inputGroup.length)]
    }

    const crossover = (parent1, parent2) => {

        const parent1Weights = parent1.weights
        const parent2Weights = parent2.weights

        const minimumDivision = Math.floor(parent1Weights.length / 4)
        const divisionPoint = MathHelper.randomInt(minimumDivision, parent1Weights.length - minimumDivision)

        const parent1Slice1 = parent1Weights.slice(0, divisionPoint)
        const parent2Slice1 = parent2Weights.slice(divisionPoint)

        const parent2Slice2 = parent2Weights.slice(0, divisionPoint)
        const parent1Slice2 = parent1Weights.slice(divisionPoint)

        const child1Weights = parent1Slice1.concat(parent2Slice1)
        const child2Weights = parent2Slice2.concat(parent1Slice2)

        return [{
            weights: child1Weights
        }, {
            weights: child2Weights
        }]
    }

    return {
        process: process
    }
}