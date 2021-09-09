import { faker } from '../deps.ts'

const createMessage = () => {
	return {
		itemId: faker.random.uuid(),
		product: faker.commerce.productName(),
		store: faker.commerce.department(),
		quantity: faker.random.number()
	}
}

export default createMessage