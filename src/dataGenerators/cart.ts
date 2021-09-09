import { faker } from '../deps.ts'

const possibleActions = ['add', 'delete', 'modify']

const createMessage = () => {
	return {
		itemId: faker.random.uuid(),
		userId: faker.random.uuid(),
		userName: faker.fake("{{name.firstName}} {{name.lastName}}"),
		quantity: faker.random.number(),
		action: faker.random.arrayElement(possibleActions)
	}
}

export default createMessage