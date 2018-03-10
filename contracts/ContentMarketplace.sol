pragma solidity ^0.4.4;

library Library {
    struct OrderStructure {
        address orderOwner;
        uint256 price;
        address writerAddr;
        bytes32 workIPFSHash;
        bool    isPaid;
    }
}

contract ContentMarketplace{
    using Library for Library.OrderStructure;

    address contractOwner;
    mapping (bytes32 => Library.OrderStructure) private Orders;
    mapping (address => bytes32[]) private contentWriterJobList;
    mapping (address => bytes32[]) private buyersOrderList;

    bytes32[] private freeOrderList;

    modifier isContractOwner(){
        require(msg.sender == contractOwner);
        _;
    }

    modifier isOrderOwner(bytes32 orderIPFSHash){
        require(Orders[orderIPFSHash].orderOwner == msg.sender);
        _;
    }

    modifier isOrderWriterOwner(bytes32 orderIPFSHash){
        require(Orders[orderIPFSHash].writerAddr == msg.sender);
        _;
    }

    //Check if order is not taken from anyone and can be taken for work
    modifier isOpenForApply(bytes32 orderIPFSHash){
        require(Orders[orderIPFSHash].writerAddr == 0x0000000000000000000000000000000000000000);
        _;
    }

    event OrderCreated(address owner, bytes32 orderIPFSHash);

    function ContentMarketplace() public{
        contractOwner = msg.sender;
    }

    /**
     * Buyers
     */
    //Place a order
    function makeOrder(bytes32  orderIPFSHash) public payable{
        Orders[orderIPFSHash].orderOwner = msg.sender;
        Orders[orderIPFSHash].price      = msg.value;

        buyersOrderList[msg.sender].push(orderIPFSHash);
        freeOrderList.push(orderIPFSHash);
        OrderCreated(msg.sender, orderIPFSHash);
    }

    // Work that content writer do right now
    function getBuyerOrderList(address buyerAddress) view public returns(bytes32[]){
        return  buyersOrderList[buyerAddress];
    }

    function checkOrderStatus(bytes32 orderIPFSHash) view public isOrderOwner(orderIPFSHash) returns(bool){
        if(Orders[orderIPFSHash].writerAddr == 0x0000000000000000000000000000000000000000){
            return false;
        } else {
            return true;
        }
    }

    function checkOrderPaidStatus(bytes32 orderIPFSHash) view public isOrderOwner(orderIPFSHash) returns(bool){
        return Orders[orderIPFSHash].isPaid;
    }

    function getOrderWorkResult(bytes32 orderIPFSHash) view public isOrderOwner(orderIPFSHash) returns(bytes32){
        return Orders[orderIPFSHash].workIPFSHash;
    }

    //Mark as done and force contract to pay for it
    function markOrderAsVerify(bytes32 orderIPFSHash) public isOrderOwner(orderIPFSHash) {
        require(Orders[orderIPFSHash].isPaid == false);
        require(Orders[orderIPFSHash].price <= this.balance);

        //Check if work has been done already or owner just close it and want him money back
        if(checkOrderStatus(orderIPFSHash) == false){
            msg.sender.transfer( Orders[orderIPFSHash].price );

            //Delete from this list also if he just want to get money back and cancel order
            for (uint i = 0; i < freeOrderList.length; i += 1) {
                if (orderIPFSHash == freeOrderList[i]) {
                    delete freeOrderList[i];
                }
            }
        } else {
            Orders[orderIPFSHash].writerAddr.transfer( Orders[orderIPFSHash].price );
        }

        Orders[orderIPFSHash].isPaid = true;

        //Delete finished jobs from list
        for (uint x = 0; x < buyersOrderList[msg.sender].length; x += 1) {
            if (orderIPFSHash == buyersOrderList[msg.sender][x]) {
                delete buyersOrderList[msg.sender][x];
            }
        }
    }

    /**
     * Content Writers
     */
    function takeOrder(bytes32 orderIPFSHash) public isOpenForApply(orderIPFSHash) returns(bool){
        //Check if is still available
        if(checkOrderStatus(orderIPFSHash) == false){
            Orders[orderIPFSHash].writerAddr = msg.sender;
            contentWriterJobList[msg.sender].push(orderIPFSHash);

            //Delete taken element from list
            for (uint i = 0; i < freeOrderList.length; i += 1) {
                if (orderIPFSHash == freeOrderList[i]) {
                    delete freeOrderList[i];
                }
            }
            return true;
        } else {
            return false;
        }
    }

    // Work that content writer do right now
    function getContentWriterJobList(address contentWriterAddr) view public returns(bytes32[]){
        return  contentWriterJobList[contentWriterAddr];
    }

    function submitWork(bytes32 orderIPFSHash, bytes32 workIPFSHash) public isOrderWriterOwner(orderIPFSHash){
        Orders[orderIPFSHash].workIPFSHash = workIPFSHash;

        //Delete finished jobs from list
        for (uint i = 0; i < contentWriterJobList[msg.sender].length; i += 1) {
            if (orderIPFSHash == contentWriterJobList[msg.sender][i]) {
                delete contentWriterJobList[msg.sender][i];
            }
        }
    }

    function verifyPrice(bytes32 orderIPFSHash) view public returns(uint256){
        return Orders[orderIPFSHash].price;
    }

    function checkWorkStatus(bytes32 orderIPFSHash) view public isOrderWriterOwner(orderIPFSHash) returns(bool){
        return Orders[orderIPFSHash].isPaid;
    }

    /**
     * General
     */
    function getFreeOrdersList() view public returns(bytes32 []){
        return freeOrderList;
    }

    function getBalanceOfContract() view isContractOwner public returns(uint){
        return this.balance;
    }
}