const fs = require('fs')
const mc = require('minecraft-protocol')
const Injector = require('./mclogger.js').InjectClient
//const config = JSON.parse(fs.readFileSync(process.argv[2] || 'config.json'))

global.clients = new Array();

function McClient(id, config)
{
    this.id = id
    this.config = config
}
McClient.prototype.StartClient = function() {
    let self = this
    self.client = mc.createClient({
        host: config.McHost,
        port: config.McPort,
        username: config.McUsername,
        version: config.McVersion
    })
    Injector(self.client, config, self.StartClient)
    for (let i in config.AutoRespond)
    {
        const obj = config.AutoRespond[i]
        self.client.RegisterPattern(RegExp(obj.pattern), function(p) {
            self.client.chat(obj.response)
        })
    }
    self.client.RegisterPattern(RegExp('Could not connect to a default or fallback server, please try again later: io.netty.channel.AbstractChannel$AnnotatedConnectException'), function(p) { process.exit(0) })
}


const config = JSON.parse(fs.readFileSync(process.argv[2] || 'config.json'))
var test_client = new McClient(1, config)
test_client.StartClient()
