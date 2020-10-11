const fs = require('fs')
const mc = require('minecraft-protocol')
const Injector = require('./mclogger.js').InjectClient
const config = JSON.parse(fs.readFileSync(process.argv[2] || 'config.json'))
console.log(1, config)

function StartClient() {
    global.client = mc.createClient({
        host: config.McHost,
        port: config.McPort,
        username: config.McUsername,
        version: config.McVersion
    })
    Injector(client, config, StartClient)
    for (let i in config.AutoRespond)
    {
        const obj = config.AutoRespond[i]
        client.RegisterPattern(RegExp(obj.pattern), function(p) {
            client.chat(obj.response)
        })
    }
}

StartClient()
