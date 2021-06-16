const status = require('./status.js')
const {
	spawn
} = require('child_process')
const safeJsonStringify = require('safe-json-stringify'); 

//use 'python3' on linux and 'python' on anything else
const pcmd = process.platform === 'linux' ? 'python3' : 'python'

//initialize child process
const initProc = (node) => {
	node.proc = spawn(pcmd, [node.file], ['pipe', 'pipe', 'pipe'])
	//ref: https://stackoverflow.com/questions/50787082/sending-json-from-python-to-node-via-child-process-gets-truncated-if-too-long-h
	let result = ''
	var temp_msg = node.msg

	// accumulate data until it ends
	node.proc.stdout.on('data', (data) => {
		result += data.toString()  
	})
	node.proc.stdout.on('end', () => {
		node.status(status.DONE)
		try {
			node.msg = JSON.parse(result.toString().trim())
		} catch (err) {
			node.msg = result.toString().trim()
		}
		// Check for "req" and "res" in "msg" and explicitly pass the values
		if (typeof node.msg["req"] !== 'undefined') {  
			// the variable is defined
			node.msg["req"] = temp_msg["req"]
		}
		if (typeof node.msg["res"] !== 'undefined') {   
			// the variable is defined
			node.msg["res"] = temp_msg["res"]		
		}
		var msg = node.msg
		if (node.wires.length > 1) {
			msg = [node.msg, null]
		}
		if (result.length > 0) {
			node.send(msg)
		}
	})

	//handle errors
	node.proc.stderr.on('data', (data) => {
		node.status(status.ERROR)
		try {
			node.msg = JSON.parse(data.toString())
		} catch (err) {
			node.msg = data.toString()
		}
		// Check for "req" and "res" in "msg" and explicitly pass the values
		if (typeof node.msg["req"] !== 'undefined') {  
			// the variable is defined
			node.msg["req"] = temp_msg["req"]
		}
		if (typeof node.msg["res"] !== 'undefined') {   
			// the variable is defined
			node.msg["res"] = temp_msg["res"]		
		}
        
		// capture error message
		error_msg = node.msg.split(",")

		// remove the trace part of the error message
		var msg= "Error-" + error_msg.slice(2) 

		if (node.wires.length > 1) {
			msg = [null, msg]
		}		
		
		node.send(msg) 
	})

	//handle crashes
	node.proc.on('exit', () => {
		node.proc = null
	})

	//send node configurations to child
	node.proc.stdin.write(safeJsonStringify(node.config) + '\n') // // JSON.stringify replaced by safeJsonStringify to avoid circular reference errors 
}

//send payload as json to python script
const python = (node) => {
	initProc(node)
	node.proc.stdin.write(safeJsonStringify(node.msg) + '\n')  // // JSON.stringify replaced by safeJsonStringify to avoid circular reference errors 
}

module.exports = {
	//parse string containing comma separated integers
	listOfInt: (str) => {
		var ints = null
		try {
			ints = str.replace(' ', '').split(',').map((n) => parseInt(n))
			if (ints.some(isNaN)) {
				ints = null
			}
		} finally {
			return ints
		}
	},

	//initialize node
	run: (RED, node, config) => {
		RED.nodes.createNode(node, config)
		node.status(status.NONE)

		node.proc = null
		node.msg = {}
		initProc(node)

		//process message
		const handle = (msg) => {
			node.status(status.PROCESSING)
			node.msg = msg
			if (node.topic != undefined) {
				node.msg.topic = node.topic
			}
			//send to python child
			python(node)
		}

		//handle input
		node.on('input', (msg) => {
			// if the node requires preprocessing of message, call preMsg
			if (node.preMsg != undefined) {
				node.preMsg(msg, handle)
			} else {
				handle(msg)
			}
		})

		//when node is closed, kill child process
		node.on('close', (done) => {
			node.status(status.NONE)
			if (node.proc != null) {
				node.proc.kill()
				node.proc = null
			}
			done()
		})
	}
}