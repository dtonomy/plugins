#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import ipwhois
def install(name):
    ipwhois.call(['pip', 'install', name])

import json
from ipwhois.net import Net
from ipwhois.asn import IPASN
from ipwhois.asn import ASNOrigin

def asn(ip):
    ip = Net(ip)
    obj = IPASN(ip)
    res = obj.lookup()
    return res

config = json.loads(input())
allData = json.loads(input())
result = []

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
        allData[output_path] = asn(msgBody.strip())
    elif(type(msgBody) is list):
        for ip in msgBody:
            result.append(asn(ip.strip()))
        allData[output_path] = result
    else:
        allData[output_path] = "Input type error."
except Exception as e:
    allData['payload'] = str(e)
print(json.dumps(allData))