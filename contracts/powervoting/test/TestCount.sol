// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./PowerVoting.sol";
contract TestVoting {
    //  Initialization operation;
    address public paddr;
    function beforeEach() public {
        PowerVoting p = new PowerVoting();
        paddr = address(p);
        PowerVoting(paddr).initialize();
        address[] memory addr = new address[](1);
        addr[0] = address(this);
        PowerVoting(paddr).updateProposalAllowList(addr);
    }

    function testCreateProposal() public {
        // Prepare test data 1 for normal vote counting
        PowerVoting(paddr).createProposal("Proposal 1", uint248(block.timestamp) + 300, 1, 1);

        // Prepare test data 2 for testing that only contract creators can count votes
        PowerVoting(paddr).createProposal("Proposal 2", uint248(block.timestamp) + 240, 2, 2);
    }

    function testVote() public {
        //  Enter voting data
        uint256 id = 1;
        string memory voteInfo = "votedata01";
        PowerVoting(paddr).vote(id, voteInfo) ;
    }

    //  Call counting normally
    function testCount1() public {
        uint256 id = 1;
        VoteResult[] memory voteResults = new VoteResult[](2);
        voteResults[0] = VoteResult(1, 100);
        voteResults[1] = VoteResult(2, 200);
        string memory voteListCid = "001";
        PowerVoting(paddr).count(id, voteResults, voteListCid);
    }
    //  Only the contract deployer has the vote counting authority
    function testCount2(address _addr) public returns (bool, bytes memory) {
        uint256 id = 2;
        VoteResult[] memory voteResults = new VoteResult[](2);
        voteResults[0] = VoteResult(1, 50);
        voteResults[1] = VoteResult(2, 80);
        string memory voteListCid = "002";
        (bool success, bytes memory data) = _addr.delegatecall(abi.encodeWithSignature("count(uint256, VoteResult[], string)", id, voteResults, voteListCid));
        return (success, data);
    }
}