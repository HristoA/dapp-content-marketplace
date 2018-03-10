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

    app.get('/', async function(req, res){
        var callPromise = $this.contract.getFreeOrdersList();
        var orderListByte32;
        var orderListForFE = [];

        await callPromise.then(function(result) {
            orderListByte32 = result;

            orderListByte32.forEach(function(elementValue, key){
                //Remove deleted elements
                if(elementValue == "0x0000000000000000000000000000000000000000000000000000000000000000"){
                    delete orderListByte32[key]
                }
            })
        });

        /**
         * Caching resources
         */
        if($this.orderList.length != orderListByte32.length) {

            //Delete cache elements that no more exists
            $this.orderList.forEach(function(item, key){
                if(!$this.orderListByte32.some(function(hashByte32){ return hashByte32 === item.byte32Hash}) ){
                    delete $this.orderList[key]
                }
            })

            if(Object.keys(orderListByte32).length == 0){
                $this.console("HOME_PAGE", "Getting data IPFS: " + JSON.stringify($this.orderList));
                res.render('index', { "orderList": $this.orderList});
            } else {
                var itemsProcessed = 0;

                orderListByte32.forEach(function (byte32Hash) {
                    //Check if NOT exist in cache
                    if(!$this.orderList.some(function(item){ return item.name === byte32Hash})){

                        var ipfsHash = $this.bytes32ToIPFSHash(byte32Hash);

                        $this.console("BYTE32_HASH", byte32Hash);
                        $this.console("IPFS_HASH", ipfsHash);

                        $this.ipfs.catJSON(ipfsHash, function (err, result) {
                            $this.console("IPFS", err + " | " + result);

                            $this.orderList.push({
                                "byte32Hash": byte32Hash,
                                "data"      : result
                            });

                            itemsProcessed++;

                            if (itemsProcessed == orderListByte32.length) {
                                $this.console("HOME_PAGE", "Getting data IPFS: " + JSON.stringify($this.orderList));
                                res.render('index', { "orderList": $this.orderList});
                            }
                        })
                    }
                })
            }
        } else {
            $this.console("HOME_PAGE", "Getting data from cache: " + JSON.stringify($this.orderList));
            res.render('index', { "orderList": $this.orderList});
        }
    });

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

   /* app.get('/category/all', async function (req, res) {
        let allPets = await main.getAllAvailablePets();
        let categories = await main.getCategories();
        res.render('browse.twig', {
            allPets : allPets,
            categories: categories
        });
    });*/

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