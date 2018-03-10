# Decentralized Content Marketplace
Blockchain decentralized application that connect writers with buyers of "Organic Content".

## Concept of work:
People that need "organic content" or need any job to be done that depends of getting in return text can use this DApp in 4 steps:

* John place a Order with details about the work that needs to be done and set ETH price that is ready to pay for it -  He makes transaction to ETH
* Kate chooses to work on Johns order. When is ready she hit "Submit button" and make transaction to ETH network with content of work.
* John receive ~50% random sentences from Kates work and decides if job is done correctly. When answer is positive he marks the order as 'done' and will receive origin text that Kate has written for him.
* Kate will receive money from smart contract after Johns verification.

All text information for order and also list of all orders is stored in IPFS network. The rest info is hold in ETH smart contract.

Contract is deployed to Ropsten testnet with Parity
## Smart contract
* General

| METHOD | TYPE | ACCESS |  DESCRIPTION |
| ------ | ------ | ------ |
| getFreeOrdersList | VIEW | ANYONE | List of all orders that can be done from content writers |
| getBalanceOfContract | VIEW | CONTRACT_OWNER | Balance in contract |

* Buyers

| METHOD | TYPE | ACCESS |  DESCRIPTION |
| ------ | ------ | ------ |
| makeOrder | PAYABLE | ANYONE | Set order that must be done |
| getBuyerOrderList | VIEW | ANYONE | Returns list of orders that is on the go for `msg.sender` |
| checkOrderStatus | VIEW | ORDER_OWNER | Check status of work by IPFS hash |
| getOrderWorkResult | VIEW | ORDER_OWNER | Owner can get result of order |
| markOrderAsVerify | TRANSACT | ORDER_OWNER | Mark order as done |

* Content Writers

| METHOD | TYPE | ACCESS |  DESCRIPTION |
| ------ | ------ | ------ |
| takeOrder | TRANSACT | ANYONE | Take order and start work on it |
| getContentWriterJobList | VIEW | ANYONE | Returns list of orders that must be done from `msg.sender` |
| submitWork | TRANSACT | ORDER_WORKER | Submit work for review |
| checkWorkStatus | VIEW | ORDER_WORKER | Check if he get paid for work |

## Eleemnt from order lsit
```
{
    "price"       : "0.01", //ETH
    "description" : "Transalte this text to Spanish...",
    "owner"       : "0xfc55F9A54734E99D617f3c26677616C42Dc4a8Ad",
}
```
