'use strict'

const Genetics = (function() {

    const reproduce = (parent1, parent2) => {
        const children = blockSwapCrossover(parent1, parent2, 2)
        const child = children[MathHelper.randomIntInclusive(0, 1)]

        return randomIncrementMutation(child)
    }

    const divide = (parent) => {
        return randomIncrementMutation(parent)
    }

    const halfSwapCrossover = (parent1, parent2) => {

        const minimumDivision = Math.floor(parent1.length / 4)
        const divisionPoint = MathHelper.randomInt(minimumDivision, parent1.length - minimumDivision)

        const parent1Slice1 = parent1.slice(0, divisionPoint)
        const parent1Slice2 = parent1.slice(divisionPoint)

        const parent2Slice1 = parent2.slice(0, divisionPoint)
        const parent2Slice2 = parent2.slice(divisionPoint)

        const child1 = parent1Slice1.concat(parent2Slice2)
        const child2 = parent2Slice1.concat(parent1Slice2)

        return [child1, child2]
    }

    const blockSwapCrossover = (parent1, parent2, blockMaxLength) => {
        blockMaxLength = blockMaxLength || parent1.length/2

        const blockLength = MathHelper.randomIntInclusive(1, blockMaxLength)
        const division1 = MathHelper.randomInt(blockLength, parent1.length - blockLength)
        const division2 = division1 + blockLength

        const parent1Slice1 = parent1.slice(0, division1)
        const parent1Slice2 = parent1.slice(division1, division2)
        const parent1Slice3 = parent1.slice(division2)

        const parent2Slice1 = parent2.slice(0, division1)
        const parent2Slice2 = parent2.slice(division1, division2)
        const parent2Slice3 = parent2.slice(division2)

        const child1 = parent1Slice1.concat(parent2Slice2).concat(parent1Slice3)
        const child2 = parent2Slice1.concat(parent1Slice2).concat(parent2Slice3)

        return [child1, child2]
    }

    const bitSwapCrossover = (parent1, parent2) => {

        const parents = [
            parent1,
            parent2
        ]

        const children = [
            [],
            []
        ]

        for (let i = 0; i < parents[0].length; i++) {
            if (MathHelper.random(0, 1) < 0.6) {
                children[0][i] = parents[0][i]
                children[1][i] = parents[1][i]
            } else {
                children[0][i] = parents[1][i]
                children[1][i] = parents[0][i]
            }
        }

        return children
    }

    const randomMutation = (child) => {
        const noMutationChance = 17
        let mutations = MathHelper.randomInt(0, 20)

        if (mutations <= noMutationChance) return child

        mutations = mutations - noMutationChance

        for (let i = 0; i < mutations; i++) {
            const gene = MathHelper.randomInt(0, child.length)
            child[gene] = MathHelper.randomInclusive(-1, 1)
        }

        return child
    }

    const randomIncrementMutation = (child) => {
        const noMutationChance = 17
        let mutations = MathHelper.randomInt(0, 20)

        if (mutations <= noMutationChance) return child

        mutations = mutations - noMutationChance

        for (let i = 0; i < mutations; i++) {
            const gene = MathHelper.randomInt(0, child.length)
            const value = MathHelper.randomInclusive(-1, 1)
            child[gene] = child[gene] + value
        }

        return child
    }

    return {
        reproduce,
        divide
    }
})()
