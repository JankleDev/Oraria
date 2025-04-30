export class Weight {
	constructor(weight, content) {
		this.weight = weight;
		this.content = content;
	}

	static sortWeights(weights) {
		return weights.sort((a, b) => b.weight - a.weight);
	}

	static getHeaviest(weights) {
		let heaviest = null;

		for (const weight of weights) {
			if (heaviest === null || weight.weight > heaviest.weight) {
				heaviest = weight;
			}
		}

		return heaviest;
	}

	static randomWeight(weights) {
		const totalWeight = weights.reduce((total, weight) => total + weight.weight, 0);
		const randomWeight = Math.random() * totalWeight;
		let currentWeight = 0;

		for (const weight of weights) {
			currentWeight += weight.weight;

			if (randomWeight < currentWeight) {
				return weight;
			}
		}

		return weights[0];
	}
}
