
import {SourceConfig, Message} from '../types.ts'

const publishEvent = async (source: SourceConfig, message: Message) => {
	const topicUrl = source.targetTopic
	await fetch(
		topicUrl,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		})
		.catch((error) => {
			console.error('Error:', error)
		});
}

export default publishEvent
