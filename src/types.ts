export type Config = {
	workers: WorkerConfig[],
	sources: SourceConfig[]
}

export type WorkerConfig = {
	pattern: string,
	repeat: number
}

export type SourceConfig = {
	id: string,
	groupName: string,
	targetTopic: string,
	types: Array<'cart'|'inventory'|'payment'>
}

export type Latency = {
	group: string
    messages: number,
	totalLatency: number,
    avgLatency: number
}

export type Message = {
	id: string,
	source: string,
	topic: string,
	type: string,
	created_timestamp_microsec: number,
	received_timestamp_microsec?: number,
	data: any
}