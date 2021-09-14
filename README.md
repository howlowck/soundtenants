# SoundTenants

A messaging testing tool to see how your multi-tenant messaging system handle noisy neighbors.

![demo-gif](./docs/media/soundtenants-demo.gif)

## Features (& Goals)

* Cross-Platform
* Flexible
* Provider-Agnostic

## Getting Started

### Using `Deno`

1. Install [Deno](https://deno.land/#installation) and [Velociraptor](https://velociraptor.run/docs/installation/)
2. Clone this Repo
3. Now you can run `vr help` to see the possible commands
4. In the root project folder, run `vr init <filename>` (ie `vr init config.json`) to create a new Config json file
5. Edit the config json file (see details in the next section)
6. Run `vr start <filename>` to start the test.

### Using Docker

Docker enables you to quickly use the tool

1. Build the image

``` bash
docker build -t soundtenants .
```

2. Execute the tool using docker mounting the local config folder

>NOTE: It is necessary to specify the whole local path

``` bash
docker run -p 8080:8080 -it -v <local-config-folder>:/config soundtenants vr start /config/config.json
```

>NOTE: You can use [ngrok](http://ngrok.com) to create a route back to the event listener, allowing you to run the tool local and send messages from the outside.

### Install Ngrok

``` bash
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip -o ~.
unzip ~/ngrok-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin
```

### Executing Ngrok

``` bash
ngrok http 8080
```

### Using Native Binary

As soon as [Deno compiled binary supports web workers](https://github.com/denoland/deno/issues/8654)

## Understanding the Config file

In order to fully utilize this tool, it's important to understand the concepts that makes this tool flexible. You can see [some example config files here](https://github.com/howlowck/soundtenants/tree/main/src/configStubs).

There are two main components to the config file: `workers` and `sources`. Workers describe "what" messages to send, and "Sources" describe the "how": how to compose the messages, and how to send them.

### Workers

Workers are the agents that will publish the messages. You can specify an array of workers, all workers will start and execute in parallel, publishing the messages per its specified pattern.

```ts
export type WorkerConfig = {
 pattern: string, // the pattern string
 repeat: number // how many times to repeat the pattern
}
```

The pattern sequence is read left-to-right (left most message in the pattern is published first).
Here are the components to the pattern schema: `<sourceId>*<count>,...,(<ratio>:<sourceId>|<ratio>:<sourceId>|...)`.

### Sources

A source describes how to publish and generate a message. It has these following properties:

```ts
export type SourceConfig = {
 id: string, // the id of the source used by the pattern in a `worker`, recommend to use a single letter for ease of composing the pattern
 groupName: string, // the pivot point for aggregation, recommend using the tenant name or specific topic depending on the target scenario
 targetTopic: string, // the endpoint to the topic (right now only 'http' are supported)
 types: Array<'cart'|'inventory'|'payment'> // an array of possible message types to generate
}
```

## How to Use the Tool with any Architecture

One of the main goals of this tool is that it's platform-agnostic, meaning that it should be able to test any messaging architecture. Currently it only supports publishing to HTTP endpoints.
We want the tool to be thin, so here are some external components required for this tool to work:

* a Reverse Proxy like (ngrok) to open a internet accessible url to your computer to the localhost listening port
* a simple service in your messaging architecture that can call to the reverse-proxied URL with the published message

![architecture](./docs/media/hi-lvl-architecture.drawio.png)
