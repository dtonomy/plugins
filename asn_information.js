module.exports = function (RED) {
    function asn_information(config) {
        const utils = require('../utils/utils')
        RED.nodes.createNode(this, config);  
        var node = this
        node.topic = 'asn_information'

        node.file = __dirname + '/asn_information.py'
  
        node.config = {
            ip: config.ip,
            input: config.input,
            output: config.output
        }

        utils.run(RED, node, config)
    }
    RED.nodes.registerType("asn_information", asn_information);
}
