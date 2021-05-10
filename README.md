# main
## plugins
### 3rd Party Integrations 
========================

# asn
## ASN NODE
### What is this used for?
It's a node to help users get ASN information when they enter IPs. 

### Example
Input: <br />
'2001:43f8:7b0::','2603:8001:2443:ec00:d069:52f:16cc:3ae5'<br />
Output: <br />
{'asn': '37578',
 'asn_cidr': '2001:43f8:7b0::/48',
 'asn_country_code': 'KE',
 'asn_date': '2013-03-22',
 'asn_description': 'Tespok, KE',
 'asn_registry': 'afrinic'}<br />
{'asn': '20001',
 'asn_cidr': '2603:8000::/28',
 'asn_country_code': 'US',
 'asn_date': '2017-03-20',
 'asn_description': 'TWC-20001-PACWEST, US',
 'asn_registry': 'arin'}

### Installation
` npm i asn_information --save `<br />
`npm i asn_information`
