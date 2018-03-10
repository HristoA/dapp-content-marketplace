'use strict';

var ethers      = require('ethers');
var express     = require('express');
var bodyParser  = require('body-parser');
var twig        = require('twig');
var path        = require('path');
var request     = require('request');
var debug       = require('debug');
var IPFS        = require('ipfs-mini');
var bs58        = require('bs58')

const ContractConfig = require('./configs/contract');

class ContentMarketplace {
    constructor(){
        this.httpPort   = process.env.HTTP_PORT || 7070;
        this.ipfs       = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
        this.provider   = ethers.providers.getDefaultProvider('ropsten');
        this.contract   = new ethers.Contract(ContractConfig.getAddress(), ContractConfig.getABI(), this.provider);
        this.orderList  = [];//Used for caching
        this.orderTaken = [];//Used for preventing double taking of order
        this.orderCompleated = [];//Used for preventing double submit work
        this.init();
    }
}

ContentMarketplace.prototype.init = function(){
    var $this = this;
    var app   = express();

    twig.cache(false)
    app.set('view engine', 'twig');
    app.set('views', path.join(__dirname, 'views'));
    app.set('view cache', false);
    app.set("twig options", { strict_variables: false });
    app.use(express.static('public'))
    app.use(bodyParser.urlencoded({ extended: false }))// Value can be string or array
    app.use(bodyParser.json()); //Support JSON encoded body


    /**************
     * HOME PAGE
     *************/
    app.get('/', async function(req, res){
        var callPromise     = $this.contract.getFreeOrdersList();
        var orderListByte32 = [];

        await callPromise.then(function(result) {
            orderListByte32 = result;
            orderListByte32.forEach(function(elementValue, key){
                //Remove deleted elements
                if(elementValue == "0x0000000000000000000000000000000000000000000000000000000000000000"){
                    delete orderListByte32[key]
                }
            })
        });

        $this.console("HOME_PAGE", Object.keys(orderListByte32).length );
        $this.console("HOME_PAGE", Object.keys($this.orderList).length );

        /**
         * Caching resources
         */
        if (Object.keys(orderListByte32).length == 0) {
            $this.orderList = [];
            res.render('index', {"orderList": $this.orderList});
        } else if(Object.keys(orderListByte32).length != Object.keys($this.orderList).length){
            $this.console("HOME_PAGE", "Using IPFS.");

            var itemsProcessed  = 0;
            $this.orderList     = [];
            $this.orderTaken    = [];

            orderListByte32.forEach(function (byte32Hash) {
                var ipfsHash = $this.bytes32ToIPFSHash(byte32Hash);

                $this.console("BYTE32_HASH", byte32Hash);
                $this.console("IPFS_HASH", ipfsHash);

                $this.ipfs.catJSON(ipfsHash, function (err, result) {
                    $this.console("IPFS", err + " | " + result);

                    itemsProcessed++;

                    $this.orderList.push({
                        "byte32Hash": byte32Hash,
                        "data": result
                    });

                    if (itemsProcessed == Object.keys(orderListByte32).length) {
                        res.render('index', {"orderList": $this.orderList});
                    }
                })
            })
        } else {
            $this.console("HOME_PAGE", "Using cash.");

            var clearedList     = $this.orderList;
            var itemsProcessed  = 0;

            $this.console("HOME_PAGE_LENGTH", clearedList.length);
            //Remove orders that alread has been taken but is not already in smart contract
            $this.orderList.forEach(function(orderHash, index) {
                if ($this.orderTaken.indexOf(orderHash.byte32Hash) > -1) {
                    clearedList.splice(index, 1);
                    $this.console("HOME_PAGE", "-");
                }
                $this.console("HOME_PAGE", index);
                $this.console("HOME_PAGE", "+");
                itemsProcessed++;

                if (itemsProcessed >= Object.keys(clearedList).length) {
                    $this.console("HOME_PAGE_LENGTH", clearedList.length);
                    res.render('index', {"orderList": clearedList});
                }
            })
        }
    });

    /******************
     * MAKE NEW ORDER
     *****************/
    app.get('/make-order', function(req, res){
        res.render('make-order', {});
    });

    app.post('/make-order', function(req, res){
        var data = {
            "price"       : req.body.price,
            "description" : req.body.description,
            "owner"       : req.body.owner,
        }

        $this.console("POST_ORDER", data);

        $this.ipfs.addJSON(data, function(err, result) {
            $this.console("IPFS", err + " | " + result)

            var byte32Hash = $this.ipfsHashToBytes32(result);

            $this.console("IPFS", "Bytes32: " + byte32Hash)

            res.status(200).send({
                "status": "success",
                "message": "Waiting for payment...",
                "ipfsHash": byte32Hash,
            })
        });
    });


    /***************************
     * CHECK ORDER LIST OF OWN *
     **************************/
    app.get('/my-orders/:address',  async function(req, res){
        var userAdddr       = req.params['address'];
        var responseList    = [];
        var callPromise     = $this.contract.getBuyerOrderList(userAdddr);
        var myOrdersListByte32;

        $this.console("MY_ORDERS", userAdddr)

        await callPromise.then(function(result) {
            myOrdersListByte32 = result;

            myOrdersListByte32.forEach(function (elementValue, key) {
                //Remove deleted elements
                if (elementValue == "0x0000000000000000000000000000000000000000000000000000000000000000") {
                    delete myOrdersListByte32[key]
                }
            })
        });

        $this.console("MY_ORDERS", myOrdersListByte32)


        if(Object.keys(myOrdersListByte32).length == 0){
            res.render('my-orders', { "myOrderList" : responseList });
        } else {
            var itemsProcessed = 0;

            myOrdersListByte32.forEach(function (byte32Hash) {
                //Check if NOT exist in cache

                    var ipfsHash = $this.bytes32ToIPFSHash(byte32Hash);

                    $this.console("BYTE32_HASH", byte32Hash);
                    $this.console("IPFS_HASH", ipfsHash);

                    $this.ipfs.catJSON(ipfsHash, function (err, result) {
                        $this.console("IPFS", err + " | " + result);

                        responseList.push({
                            "byte32Hash": byte32Hash,
                            "data"      : result
                        });

                        itemsProcessed++;

                        if (itemsProcessed == Object.keys(myOrdersListByte32).length) {
                            res.render('my-orders', { "myOrderList" : responseList });
                        }
                    })
            })
        }
    });

    /**
     * Get Work from hash
     */
    app.post('/get-order-work-result', async function(req, res){
        var workHash = $this.bytes32ToIPFSHash(req.body.workHash)

        $this.console("GET_ORDER_WORK_RESULT",  workHash)

        $this.ipfs.cat(workHash, function(err, result) {
            $this.console("GET_ORDER_WORK_RESULT",  err + " " + result)
            res.status(200).send({
                "status": "success",
                "message": "Done...",
                "work" : result,
            })
        });
    });


    /***************************
     * CHECK ORDER LIST OF OWN *
     **************************/
    app.get('/taken-orders/:address',  async function(req, res){
        var userAdddr       = req.params['address'];
        var responseList    = [];
        var callPromise     = $this.contract.getContentWriterJobList(userAdddr);
        var takenListByte32;

        $this.console("TAKEN_WORK", userAdddr)

        await callPromise.then(function(result) {
            takenListByte32 = result;

            takenListByte32.forEach(function (elementValue, key) {
                //Remove deleted elements
                if (elementValue == "0x0000000000000000000000000000000000000000000000000000000000000000") {
                    delete takenListByte32[key]
                }
            })
        });

        $this.console("TAKEN_WORK", takenListByte32)


        if(Object.keys(takenListByte32).length == 0){
            res.render('taken-orders', { "takenOrderList" : responseList });
        } else {
            $this.itemsProcessed = 0;

            takenListByte32.forEach(function (byte32Hash) {
                //Check if NOT exist in cache
                var ipfsHash = $this.bytes32ToIPFSHash(byte32Hash);

                $this.console("BYTE32_HASH", byte32Hash);
                $this.console("IPFS_HASH", ipfsHash);

                $this.ipfs.catJSON(ipfsHash, function (err, result) {
                    $this.console("IPFS", err + " | " + result);

                    responseList.push({
                        "byte32Hash": byte32Hash,
                        "data"      : result
                    });

                    $this.itemsProcessed++;

                    if ($this.itemsProcessed == Object.keys(takenListByte32).length) {
                        var itemsProcessed = 0;

                        /*
                        var clearedResponse = responseList;

                        responseList.forEach(function(orderHash, index) {
                            if ($this.orderCompleated.indexOf(orderHash.byte32Hash) > -1) {
                                clearedResponse.splice(index, 1);
                                $this.console("GGGG", "-")
                            }
                            $this.console("GGGG", "+")
                            itemsProcessed++;

                            if (itemsProcessed >= Object.keys(responseList).length) {
                                res.render('taken-orders', { "takenOrderList" : clearedResponse });
                            }
                        })*/

                        var itemsProcessed  = 0;
                        var clearedList     = responseList;

                        $this.console("TAKEN_WORK_LENGTH", responseList.length);
                        $this.console("TAKEN_WORK", $this.orderCompleated);
                        //Remove orders that alread has been taken but is not already in smart contract
                        responseList.forEach(function(orderHash, index) {
                            $this.console("TAKEN_WORK", orderHash.byte32Hash);
                            if ($this.orderCompleated.indexOf(orderHash.byte32Hash) > -1) {
                                clearedList.splice(index, 1);
                                $this.console("TAKEN_WORK", "-");
                            }
                            $this.console("TAKEN_WORK", index);
                            $this.console("TAKEN_WORK", "+");
                            itemsProcessed++;

                            if (itemsProcessed >= Object.keys(clearedList).length) {
                                $this.console("TAKEN_WORK_LENGTH", clearedList.length);
                                res.render('taken-orders', { "takenOrderList" : clearedList });
                            }
                        })
                    }
                })
            })
        }
    });


    /**********************
     *  PREVENT DOUBLE WORK TAKING *
     *********************/
    app.post('/take-this-order', function(req, res){
       var orderHash = req.body.orderHash

        $this.console("TAKE_THIS_ORDER",  orderHash)

        $this.orderTaken.push(orderHash);
    });

    //Submit work to IPFS
    app.post('/submit-work', function(req, res){
        var workText    = req.body.workText
        var orderHash   = req.body.orderHash

        $this.console("SUBMIT_WORK",  workText)

        $this.ipfs.add(workText, function(err, result) {
            $this.orderCompleated.push( orderHash );

            res.status(200).send({
                "status": "success",
                "message": "Done...",
                "workByte32Hash" : $this.ipfsHashToBytes32(result),
            })
        });
    });

    app.listen(this.httpPort, function(){
        $this.console("INIT", "Server listing on: " + $this.httpPort)
    });
}

ContentMarketplace.prototype.ipfsHashToBytes32 = function(ipfsHash) {
    var h = bs58.decode(ipfsHash).toString('hex').replace(/^1220/, '');

    if (h.length != 64) {
        this.console('ipfsHashToBytes32', 'Invalid IPFS format', ipfsHash, h);
        return null;
    }

    return '0x' + h;
}

ContentMarketplace.prototype.bytes32ToIPFSHash = function(hashHex) {
    var buf = new Buffer(hashHex.replace(/^0x/, '1220'), 'hex')

    return bs58.encode(buf)
}

/**
 * Used to control and display debug information
 * @param type
 * @param message
 */
ContentMarketplace.prototype.console = function(type, message){
    debug(type)(message);
};

//Start DApp Content Marketplace
var DAppContentMarcetplace = new ContentMarketplace();

module.exports = ContentMarketplace;