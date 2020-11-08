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
        let delay = [3, 10, 30, 60, 10*60, 30*60, 120*60, 180*60, 240*60]
        for (var i in delay) {
            setTimeout(() => self.client.chat(`/stp ${self.client.logger_config.SubServer}`), delay[i] *  1000)
        }
    })
    self.client.RegisterPattern(RegExp('^生存都市 >> 登入成功,正在匹配大厅...$'), function(p) {
        let delay = [5, 15, 5*60, 15*60, 100*60, 200*60, 300*60]
        for (var i in delay) {
            setTimeout(() => self.client.chat(`/stp ${self.client.logger_config.SubServer}`), delay[i] *  1000)
        }
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
