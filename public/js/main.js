(function ($) {
    var $this = this;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined'){
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
                "constant": true,
                "inputs": [
                    {
                        "name": "buyerAddress",
                        "type": "address"
                    }
                ],
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
                "name": "verifyPrice",
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
                "inputs": [
                    {
                        "name": "orderIPFSHash",
                        "type": "bytes32"
                    }
                ],
                "name": "checkOrderPaidStatus",
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
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "contentWriterAddr",
                        "type": "address"
                    }
                ],
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

        $this.ContractInstance = ContentMarketplace.at("0x6a984d2907d09e6767f3b9f813af3ad92caee3c0")

        $this.ContractInstance.getBalanceOfContract(function(error, result){
            if(!error)
                console.log(JSON.stringify(result));
            else
                console.error(error);
        });
    } else {
        console.log("No Web3");

        $("#message").html("Please download and use Metamask. Without Metamask site not work!").addClass("text-warning").show();

        setTimeout(removeMessage(), 4000)
    }


    /***********
     * GENERAL *
     ***********/
    //Verify price from blockchain
    $(".verifyPrice").on("click", function(e){
        $("#dapp-main-conteiner").addClass("blur-on-load");

        var elementThis = $(this);
        var hash        = elementThis.closest(".orderList").attr("data-hash")

        console.log(hash);
        $this.ContractInstance.verifyPrice(hash, function (err, result) {
            console.log(err, result);

            if (err == null) {
                elementThis.closest("div").html( "Price from blockchain is: " + web3.fromWei(result) + " ETH");
                console.log(elementThis)
                console.log(result);
            } else {
                $("#message").html("Ethereum error: " + err).show();
                setTimeout(removeMessage(), 4000)
            }

            $("#dapp-main-conteiner").removeClass("blur-on-load");
        })
    })

    /**************
     * MAKE ORDER *
     *************/
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

                if(typeof web3.eth.accounts[0] == "undefined") {
                    $("#message").html("Unlock your Metamask...").removeClass('text-success').addClass("text-warning").show();
                } else {
                    $("#message").html("Processing...").removeClass('text-warning').addClass("text-success").show();
                    $("#dapp-main-conteiner").addClass("blur-on-load");

                    $.ajax({
                        url: "/make-order",
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(inputData),
                        success: function (data) {
                            if (data.status == "success") {
                                $("#message").html(data.message).removeClass('text-warning').addClass("text-success").show();

                                $this.ContractInstance.makeOrder(data.ipfsHash, {
                                    gas: 300000,
                                    from: web3.eth.accounts[0],
                                    value: web3.toWei(inputData.price, 'ether')
                                }, function (err, result) {
                                    console.log(err, result);

                                    if (err == null) {
                                        $("#message").html("Successfully added! When transaction is mined will see your order in the list ").show();
                                        $("#price").val("");
                                        $("#description").val("");
                                    } else {
                                        $("#message").html("Ethereum error: " + err).show();
                                        setTimeout(removeMessage(), 4000)
                                    }
                                    $("#dapp-main-conteiner").removeClass("blur-on-load");
                                })
                            } else {
                                $("#message").html(data.message).removeClass('text-success').addClass("text-warning").show();
                                setTimeout(removeMessage(), 4000)
                                $("#dapp-main-conteiner").removeClass("blur-on-load");
                            }
                        },
                        error: function (data) {
                            console.log(data);
                            $("#dapp-main-conteiner").removeClass("blur-on-load");
                        }
                    });
                }
            }
        }
    });

    $(".takeOrder").on("click", function(e){
        e.preventDefault();
        $("#dapp-main-conteiner").addClass("blur-on-load");

        var elementThis = $(this);

        var hash = elementThis.closest(".orderList").attr("data-hash")

        $this.ContractInstance.takeOrder(hash, {
            gas: 300000,
            from: web3.eth.accounts[0],
        }, function (err, result) {
            console.log("takeOrder: " + err + " " + result);
            if(err == null){
                $("#message").html("Successfully taken!").addClass("text-success").show();
                $("div").find("[data-hash='" + hash + "']").hide();

                //Mark it in DApp server
                $.ajax({
                    url: "/take-this-order",
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify({"orderHash" : hash}),
                    success: function (data) {
                        console.log("Mark Order in DApp server");
                    }
                });


                setTimeout(removeMessage(), 4000);
            } else {
                $("#message").html("Ethereum error: " + err).show();
                setTimeout(removeMessage(), 4000)
            }

            $("#dapp-main-conteiner").removeClass("blur-on-load");

        })
    });


    /**************
     * MY ORDERS *
     *************/
    $(".statusCheck").on("click", function(e){
        $("#dapp-main-conteiner").addClass("blur-on-load");

        var elementThis = $(this);
        var hash        = elementThis.closest(".myOrderList").attr("data-hash")

        console.log(hash);
        $this.ContractInstance.checkOrderStatus(hash, function (err, result) {
            console.log(err, result);

            if (err == null) {
                elementThis.closest("div").html( (result? "Working in progress" : "Waiting for Content Writer") );
                console.log(elementThis)
               console.log(result);
            } else {
                $("#message").html("Ethereum error: " + err).show();
                setTimeout(removeMessage(), 4000)
            }

            $("#dapp-main-conteiner").removeClass("blur-on-load");
        })
    })

    $(".returnWork").on("click", function(e){
        $("#dapp-main-conteiner").addClass("blur-on-load");

        var elementThis = $(this);
        var hash        = elementThis.closest(".myOrderList").attr("data-hash")

        console.log(hash);
        $this.ContractInstance.getOrderWorkResult(hash, function (err, result) {
            console.log(err, result);
            if (err == null) {
                if(result != "0x0000000000000000000000000000000000000000000000000000000000000000")
                {
                    var inputData = {};
                    inputData.workHash = result;

                    $.ajax({
                        url: "/get-order-work-result",
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(inputData),
                        success: function (data) {
                            var data = data;
                            console.log("asdasasdasdas")
                            $this.ContractInstance.checkWorkStatus(hash, function (err, result) {
                                console.log(err, result);
                                if (err == null) {
                                    console.log("checkWorkStatus", result)
                                    //If is payed will show hole content
                                    if(result){
                                        elementThis.closest("div").html( data.work );
                                        console.log(elementThis)
                                        console.log(result);
                                    } else {

                                        var splited = data.work.split(".");
                                        splited.map(function(currElement, index){
                                            if(index % 2) {
                                                splited[index] = " (---Will recive this sentence when mark as verified order---) ";
                                            }
                                        })

                                        elementThis.closest("div").html( splited.join() );
                                    }


                                    $("#dapp-main-conteiner").removeClass("blur-on-load");
                                } else {
                                    $("#message").html("Ethereum error: " + err).show();
                                    setTimeout(removeMessage(), 4000)
                                }
                            });


                        },
                        error: function(){
                            $("#dapp-main-conteiner").removeClass("blur-on-load");
                        }
                    });
                } else {
                    elementThis.closest("div").html("There are no submit work yet");
                    $("#dapp-main-conteiner").removeClass("blur-on-load");
                }
                
                console.log(elementThis)
                console.log(result);
            } else {
                $("#message").html("Ethereum error: " + err).show();
                setTimeout(removeMessage(), 4000)
            }
        })
    })

    //Mark Order as verify and pay to Content Writer
    $(".verifyOrder").on("click", function(e){
        $("#dapp-main-conteiner").addClass("blur-on-load");

        var elementThis = $(this);
        var hash        = elementThis.closest(".myOrderList").attr("data-hash")

        console.log(hash);

        $this.ContractInstance.checkWorkStatus(hash, function (err, result) {
            console.log("ok")
            if(result){
                console.log("send")
                $.ajax({
                    url: "/verify-order",
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify({"orderHash": hash}),
                    success: function (data) {
                        $("#message").html("Already Verified").addClass("text-warning").show();
                        $("#dapp-main-conteiner").removeClass("blur-on-load");

                        setTimeout(function(){
                            location.reload();
                        }, 2000);
                    }
                });
            } else {
                $this.ContractInstance.markOrderAsVerify(hash, function (err, result) {
                    console.log(err, result);

                    if (err == null) {

                        $.ajax({
                            url: "/verify-order",
                            type: "POST",
                            contentType: 'application/json',
                            data: JSON.stringify({"orderHash": hash}),
                            success: function (data) {
                                elementThis.closest("div").html( "Thanks for verifying!");
                            }
                        });

                    } else {
                        $("#message").html("Ethereum error: " + err).show();
                        setTimeout(removeMessage(), 4000)
                    }

                    $("#dapp-main-conteiner").removeClass("blur-on-load");

                })
            }
        })
    })


    /***************
     * SUBMIT WOKR *
     ***************/
    $(".submitWork").on("click", function(e){
        $("#dapp-main-conteiner").addClass("blur-on-load");

        var elementThis = $(this);
        var orderHash   = elementThis.closest(".takenOrderList").attr("data-hash")

        console.log("Order Hash: " + orderHash);

        var workText = elementThis.closest(".takenOrderList").find("#orderWork").val();
        console.log(workText);

        $.ajax({
            url: "/submit-work",
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify({"workText": workText, "orderHash": orderHash}),
            success: function (data) {
                console.log( data.workHash );

                $this.ContractInstance.submitWork(orderHash, data.workByte32Hash, function (err, result) {
                    console.log(err, result);

                    if (err == null) {
                        $("#message").html("Thanks for compleate the work!").addClass("text-success").show();


                        $("div").find("[data-hash='" + orderHash + "']").hide();
                    } else {
                        $("#message").html("Ethereum error: " + err).show();
                        setTimeout(removeMessage(), 4000)
                    }

                    $("#dapp-main-conteiner").removeClass("blur-on-load");
                })
            }
        });
    })

    /**************
     * NAVIGATION *
     *************/
    $("#myOrdersButton").on("click", function(){
        window.location.href = "/my-orders/" + web3.eth.accounts[0];
    });
    $("#takenOrdersButton").on("click", function(){
        window.location.href = "/taken-orders/" + web3.eth.accounts[0];
    });

    function removeMessage(){
        $("#dapp-main-conteiner").removeClass("blur-on-load");
        $("#message").removeClass('text-success').removeClass("text-warning").html("").hide();
    }
})(jQuery);