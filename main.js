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
    self.client.RegisterPattern(RegExp('^生存都市>> 匹配成功,欢迎回来。$'), function(p) {
        setTimeout(() => self.client.chat(`/stp ${self.client.logger_config.SubServer}`), 3000)
        setTimeout(() => self.client.chat(`/stp ${self.client.logger_config.SubServer}`), 10000)
        setTimeout(() => self.client.chat(`/stp ${self.client.logger_config.SubServer}`), 60000)
        setTimeout(() => self.client.chat(`/stp ${self.client.logger_config.SubServer}`), 60 * 60000)
    })
    self.client.RegisterPattern(RegExp('^\[AutoShutdown\](.*?)NOW!'), function(p) {
        setTimeout(() => {
            self.client.end("disconnect.quitting")
            process.exit(0)
        }, 3000)
    })
}


const config = JSON.parse(fs.readFileSync(process.argv[2] || 'config.json'))
var test_client = new McClient(1, config)
test_client.StartClient()
