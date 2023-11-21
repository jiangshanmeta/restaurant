// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Restaurant {
    address public owner;

    struct RestaurantModel {
        string name;
        uint count;
    }

    struct Voter {
        bool hasAccess;
        bool isVoted;
        uint targetIndex;
    }

    RestaurantModel[] public restaurants;
    mapping( address => Voter) public voters;

    event Voted();

    constructor(string[] memory names){
        owner = msg.sender;

        for(uint i=0;i<names.length;i++){
            restaurants.push(RestaurantModel({
                name:names[i],
                count:0
            }));
        }

        approve(owner);
    }

    function approve(address to) public {
        require(msg.sender == owner,"only owner has approve access");
        require(to != address(0), "can't handle zero-address");
        require(!voters[to].hasAccess, "already has access");

        voters[to].hasAccess = true;
        voters[to].isVoted = false;
        voters[to].targetIndex = restaurants.length;
    }

    function vote(uint targetIndex) public {
        require(targetIndex < restaurants.length, "invalid targetIndex" );
        address sender = msg.sender;
        require(voters[sender].hasAccess, "no access");
        require(!voters[sender].isVoted, "already voted");

        restaurants[targetIndex].count++;
        voters[sender].isVoted = true;
        voters[sender].targetIndex = targetIndex;

        emit Voted();
    }

    function getVoteResult() public view returns(RestaurantModel[] memory){
        return restaurants;
    }

    function getVoter(address addr) public view returns(Voter memory){
        return voters[addr];
    }

}