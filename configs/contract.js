function getAddress() {
    return "0xb7509e9e03d7607c074ae26240e7f92699a3ceea";
}

function getOwner() {
    return "0xfc55F9A54734E99D617f3c26677616C42Dc4a8Ad";
}
function getABI() {
    return [
        {
            "constant": true,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "checkWorkStatus",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getBalanceOfContract",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getContentWriterJobList",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "checkOrderStatus",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "takeOrder",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getBuyerOrderList",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "getOrderWorkResult",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "markOrderAsVerify",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getFreeOrdersList",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "makeOrder",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                },
                {
                    "name": "workIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "submitWork",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "orderIPFSHash",
                    "type": "bytes32"
                }
            ],
            "name": "OrderCreated",
            "type": "event"
        }
    ];
}

module.exports = { getOwner, getABI, getAddress};