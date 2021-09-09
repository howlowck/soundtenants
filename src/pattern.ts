const generate = (pattern: string, repeat: number): string => {
	return Array.from({length: repeat}, () => genEpoch(pattern)).join(';')
}

const genEpoch = (pattern: string) : string => {
	const chunks = pattern.split(',')
	const result = chunks.reduce((prev, curr, i) => {
		const [sub, repeatRaw] = curr.split('*')
		const repeat = parseInt(repeatRaw, 10)
		if (sub.indexOf('(') !== -1) {
			const chanceMap = parseProbabilityString(sub)
			const pattern = Array.from({ length: repeat }, genOutput(chanceMap)).join(';')
			return i === 0 ? `${prev}${pattern}`: `${prev};${pattern}`
		}

		const pattern = Array.from({ length: repeat }, () => sub).join(';')
		return i === 0 ? `${prev}${pattern}`: `${prev};${pattern}`
	}, '')
	return result
}

type Chance = {
	chance: number;
	id: string;
	weight: number;
}

const parseProbabilityString = (sub: string): Chance[] => {
	const chanceMap = sub.slice(1, -1).split('|').map(_ => {
		const [weight,id] = _.split(':')
		return {
			id,
			weight: parseInt(weight,10)
		}
	})
	const sum = chanceMap.reduce((prev, curr) => prev + curr.weight, 0)
	const withChance: Chance[] = chanceMap.map(_ => ({
		..._,
		chance: _.weight/sum
	}))

	return withChance
}

const genOutput = (chances: Chance[]) => () => {
	const fallthrough: {prev: number, res: Chance[]} = chances.reduce((prev, curr, i) => {
		const currChance = curr.chance
		const summedChance = prev.prev + currChance
		return {
			prev: summedChance,
			res: [...prev.res, {...curr, chance: summedChance}]
		}
	}, {prev: 0, res: [] as Chance[]})
	const rand = Math.random()
	const lastIndex = fallthrough.res.length - 1
	const element = fallthrough.res.find(_ => rand < _.chance) || fallthrough.res[lastIndex]
	return element.id
}

export default generate