import { faker } from '../deps.ts'

const createMessage = () => {
	return {
		transactionId: faker.random.uuid(),
		accountId: faker.finance.account(10),
		currencyCode: faker.finance.currencyCode(),
		amount: faker.random.number({min: 1, max: 10000, precision: 1}),
	}
}

export default createMessage