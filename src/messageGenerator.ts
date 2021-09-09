import {faker} from './deps.ts'
import cart from './dataGenerators/cart.ts'
import inventory from './dataGenerators/inventory.ts'
import payment from './dataGenerators/payment.ts'
import {SourceConfig, Message} from './types.ts'

const generatePayload = (type: 'cart' | 'inventory' | 'payment') => {
	if (type === 'cart') {
		return cart()
	}
	if (type === 'inventory') {
		return inventory()
	}
	
	return payment()
	
}

const generateMessage = (source: SourceConfig): Message => {
	const types = source.types
	const randomType = types[Math.floor(Math.random() * types.length)]
	const message = {
		id: faker.random.uuid(),
		source: source.groupName,
		topic: source.targetTopic,
		type: randomType,
		created_timestamp_microsec: performance.now(),
		data: generatePayload(randomType)
	}
	return message
}

export default generateMessage