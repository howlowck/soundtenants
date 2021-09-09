import { cac, config } from './deps.ts'
import generate from './pattern.ts'
import { Config, Message, Latency } from './types.ts'

const cli = cac('soundtenants')
config()

const makeLatencyObj = (group: string): Latency => {
  return {
    group,
    messages: 0,
    totalLatency: 0,
    avgLatency: 0
  }
}

const aggregator = (latencyMap: Map<string, Latency>, message: Message, now: number): Map<string, Latency> => {
  const {data: _data, ...leanMessage} = message
  leanMessage.received_timestamp_microsec = now
  const key = message.source
  const latency = latencyMap.get(key) || makeLatencyObj(key)
  const newMessagesCount = latency.messages + 1
  const newTotalLatency = latency.totalLatency + (now - message.created_timestamp_microsec)
  const newAvg = newTotalLatency / newMessagesCount
  latency.messages = newMessagesCount
  latency.avgLatency = newAvg
  latency.totalLatency = newTotalLatency
  latencyMap.set(key, latency)
  return latencyMap
}

const decoder = new TextDecoder();
async function processConnection(conn: Deno.Conn, latencyMap: Map<string, Latency>) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    // parse json
    if (requestEvent.request.body) {
      const now = performance.now()
      const body = decoder.decode(await requestEvent.request.arrayBuffer())
      const message = JSON.parse(body) as Message
      
      latencyMap = aggregator(latencyMap, message, now)
      
      console.clear()
      console.log('-------------------')
      latencyMap.forEach(_ => {
        console.log(`${_.group}    messages: ${_.messages}   avg latency in microsec: ${~~_.avgLatency}`)
      })
      console.log('-------------------')
    }

    requestEvent.respondWith(
      new Response('ok', {
        status: 200,
      })
    );
  }
}

const startReceiver = async (portRaw: string) => {
  // Start listening on port 8080 of localhost.
  const port = parseInt(portRaw, 10)
  console.log('port:', port)
  const server = Deno.listen({ port });
  console.log(`HTTP webserver running.  Access it at:  http://localhost:${port}/`);
  
  const latencyMap = new Map()

  // Connections to the server will be yielded up as an async iterable.
  for await (const conn of server) {
    // In order to not be blocking, we need to handle each connection individually
    // without awaiting the function
    processConnection(conn, latencyMap);
  }
}

cli
  .command('work <path>', 'Runs the workers to publish events')
  .action(async (path) => {
    // Start the Receiver Server
    startReceiver('8080')

    // Read config.json
    const text = await Deno.readTextFile(path);
    
    // Parse JSON
    const config = JSON.parse(text) as Config
    
    // Create Workers per config
    const workerList = config.workers.map(_ => {
      return {
        conf: _,
        worker: new Worker(new URL("./worker.ts", import.meta.url).href, { type: "module", deno: true })
      }
    })

    // Kickoff all workers
    workerList.forEach((_, i) => {
      const {conf, worker} = _
      const stringPattern = generate(conf.pattern, conf.repeat)
      worker.postMessage({
        workerName: `Worker ${i}`,
        pattern: stringPattern,
        sources: config.sources
      })
    })    
  })

cli
  .command('init <filename>', 'Generates a config file. ie "soundtenants init config.json"')
  .option('--type <type>', 'A type of scenario that the configuration would simulate. Allowed values: "basic", "multi-tenant"', {
    default: 'basic',
  })
  .action(async (filename, options) => {
    const {type}: {type: string} = options
    const __dirname = new URL('.', import.meta.url).pathname;
    const stubFile = `${__dirname}/configStubs/${type}.json`
    const targetFile = `${Deno.cwd()}/${filename}`
    await Deno.copyFile(stubFile, targetFile);
    console.log(`Your configuration file: ${filename} was generated`)
  })

// Display help message when `-h` or `--help` appears
cli.help()
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version('1.0.0')

cli.parse()