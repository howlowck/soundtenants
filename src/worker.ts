import {SourceConfig} from './types.ts'
import generateMessage from './messageGenerator.ts'
import http from './publishers/http.ts'

const memoizeSource = (sources: SourceConfig[]) => {
	const memoized = {} as Record<string, SourceConfig>
	
	return (id: string): SourceConfig => {
		const res = memoized[id]
		if (!res) {
			const source = sources.find(_ => _.id === id) as SourceConfig
			if (!source) {
				throw new Error(`Source ${id} is not found.`)
			}
			memoized[id] = source
			return source
		}
		return res
	}
}
/// @ts-ignore
self.onmessage = async (e) => {
	const {workerName, pattern, sources} = e.data
	const getSource = memoizeSource(sources)
	const patternArr = pattern.split(';')
	console.log(`~~~~~~~~~~~~~~ Starting ${workerName}`)
	for (let i = 0; i < patternArr.length; i++) {
		const id = patternArr[i];
		const source = getSource(id)
		const message = generateMessage(source)
		// console.log(`${workerName} message sent: ${JSON.stringify(message)}`)
		await http(source, message)
	}
	self.close();
};
