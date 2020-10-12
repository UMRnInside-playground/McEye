const dayjs = require('dayjs')
const fs = require('fs')
const path = require('path')

function InjectClient(client, config, onReconnect)
{
    let ChatMessage = require('prismarine-chat')(config.McVersion)
    client.logger_config = config
    client.reconnect_action = onReconnect || noop
    client.registered_patterns = new Array();

    client.on('connect', function () {
        console.info('connected')
        function DelayedAct(i, action_list)
        {
            let action = client.logger_config.PostLoginActions[i]
            if (action)
            {
                client.write('chat', {message: action})
                console.log("Running", action)
                setTimeout(() => DelayedAct(i+1, action_list), 5000)
            }
        }
        //setTimeout(() => DelayedAct(0, client.logger_config.PostLoginActions))
    })
    client.on('disconnect', function (packet) {
        console.log('disconnected: ' + packet.reason)
        if (client.logger_config.AutoReconnect)
            setTimeout(client.reconnect_action, 50000)
	else
	    process.exit(0)
    })
    client.on('end', function () {
        console.log('Connection lost')
        if (client.logger_config.AutoReconnect)
            setTimeout(client.reconnect_action, 50000)
	else
	    process.exit(0)
    })
    client.on('chat', function (packet) {
        const jsonMsg = JSON.parse(packet.message)
        const psMsg = new ChatMessage(jsonMsg)
        console.log(psMsg.toString())
        SmartLog(psMsg.toString(), client.logger_config)
        for (let i in client.registered_patterns)
        {
            const obj = client.registered_patterns[i]
            if (obj.pattern.test(psMsg))
                obj.callback(psMsg)
        }
    })
    client.RegisterPattern = function(pattern, callback) {
        client.registered_patterns.push({pattern: pattern, callback: callback})
    }
    client.chat = function(message) {
        client.write('chat', {message: message})
    }
}

function SmartLog(logmsg, config)
{
    const today = dayjs().format("YYYYMMDD")
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss")
    const content = `[${now}] ${logmsg}\n`

    const logfile = path.join(config.LogDirectory, `${config.LogPrefix}${today}${config.LogSuffix}.log`)
    fs.writeFile(logfile, content, {'flag': 'a'}, function(err) {
        if (err)
            console.log(err)
    })
}

function noop() {}

module.exports = {
    InjectClient,
    SmartLog
}
