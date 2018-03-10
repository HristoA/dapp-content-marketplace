(function ($) {
    window.addEventListener('load', function() {

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            console.log("We have Web3 ;)");

            $("#message").html("Using Web3 external wallet: " + (web3.currentProvider.isMetaMask == true ? "Metamask" : ""))
                .addClass("text-success").show();

            setTimeout(removeMessage(), 2000)

            this.web3 = new Web3(web3.currentProvider)

            web3.version.getNetwork(function(err, netId) {
                switch (netId) {
                case "1":
                    console.log('This is mainnet')
                    break
                case "2":
                    console.log('This is the deprecated Morden test network.')
                    break
                case "3":
                    console.log('This is the ropsten test network.')
                    break
                case "4":
                    console.log('This is the Rinkeby test network.')
                    break
                case "42":
                    console.log('This is the Kovan test network.')
                    break
                default:
                    console.log('This is an unknown network.')
                }
            })

            // Now you can start your app & access web3 freely:
            startApp();

        } else {
            console.log("No Web3");

            $("#message").html("Please download and use Metamask. Without Metamask site not work!").addClass("text-warning").show();

            setTimeout(removeMessage(), 4000)
        }
    })

    function startApp(){
        const ContentMarketplace = web3.eth.contract([
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
        ])

        this.ContractInstance = ContentMarketplace.at("0xb7509e9e03d7607c074ae26240e7f92699a3ceea")

        this.ContractInstance.getBalanceOfContract(function(error, result){
            if(!error)
                console.log(JSON.stringify(result));
            else
                console.error(error);
        });

        this.ContractInstance.getOrdersList(function(error, result){
            if(!error)
                console.log(JSON.stringify(result));
            else
                console.error(error);
        });
    }

    $("#orderForm").submit(function(e){
        e.preventDefault();

        if (typeof web3 !== 'undefined') {
            var form = $("#orderForm");
            form.validate()

            if (form.valid()) {
                var inputData = {};
                inputData.price       = $("#price").val();
                inputData.description = $("#description").val();
                inputData.owner       = web3.eth.accounts[0]

                $("#message").html("Processing...").removeClass('text-warning').addClass("text-success").show();

                $.ajax({
                    url: "/make-order",
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify(inputData),
                    success: function (data) {
                        if (data.status == "success") {
                            $("#message").html(data.message).removeClass('text-warning').addClass("text-success").show();

                            ContractInstance.makeOrder(data.ipfsHash, {
                                gas: 300000,
                                from: web3.eth.accounts[0],
                                value: web3.toWei(inputData.price, 'ether')
                            }, function (err, result) {
                                console.log(err, result);

                                if(err == null){
                                    $("#message").html("Successfully added!").show();
                                    $("#price").val("");
                                    $("#description").val("");
                                } else {
                                    $("#message").html("Ethereum error: " + err).show();
                                    setTimeout(removeMessage(), 4000)
                                }
                            })
                        } else {
                            $("#message").html(data.message).removeClass('text-success').addClass("text-warning").show();
                            setTimeout(removeMessage(), 4000)
                        }
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            }
        }
    });

    $("#takeOrder").click(function(e){
        e.preventDefault();

       var hash =  $("#takeOrder").attr("data-hash")

        ContractInstance.takeOrder(hash, {
            gas: 300000,
            from: web3.eth.accounts[0],
        }, function (err, result) {
            console.log(err, result);

            if(err == null){
                $("#message").html("Successfully taken!").show();
                $("div").find("[data-hash='" + hash + "']").hide();
            } else {
                $("#message").html("Ethereum error: " + err).show();
                setTimeout(removeMessage(), 4000)
            }
        })
    });


    function removeMessage(){
        $("#message").removeClass('text-success').removeClass("text-warning").html("").hide();
    }
})(jQuery);