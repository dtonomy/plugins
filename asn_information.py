import json
from ipwhois.net import Net
from ipwhois.asn import IPASN
from ipwhois.asn import ASNOrigin

result = []

def enterSingleIp(net):
    net = Net(net)
    obj = IPASN(net)
    res = obj.lookup()
    return res

def enterMultipleIp(nets):
    result = []
    for net in nets:
        result.append(enterSingleIp(net))
    return result

allData, config = {}, {}
allData['payload'] = '2603:8001:2443:ec00:d069:52f:16cc:3ae5'
# Payload by default
if "payload" in allData:
    msgBody = allData['payload']
if "input" in config:
    input_path = config['input']
    if len(input_path) > 0:
        if input_path in allData:
            msgBody = allData[input_path]
        else:
            allData['payload'] = input_path + " does not exist in msg"
            print(json.dumps(allData))
            exit()
# Check output path
if "output" in config and config['output'] != "":
    output_path = config['output']
else:
    output_path = 'payload'
try:
    if(type(msgBody) is str):
        # allData[output_path] = queryIp(msgBody.strip())
        allData[output_path] = single(msgBody.strip())
    elif(type(msgBody) is list):
        for ip in msgBody:
            # result.append(queryIp(ip.strip()))
            result.append(multiple(ip.strip()))
        allData[output_path] = result
    elif "ip" in config and len(config['ip']) > 0:
        msgBody = config['ip']
        # allData[output_path] = queryIp(msgBody.strip())
        allData[output_path] = single(msgBody.strip())
    else:
        allData[output_path] = "Input type error."
except Exception as e:
    allData['payload'] = str(e)
print(json.dumps(allData))