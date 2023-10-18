// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./PowerVoting.sol";
import "./types.sol";

contract TestPowerVoting{
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
        // Prepare test data 1 for normal voting
        PowerVoting(paddr).createProposal("Proposal 1", uint248(block.timestamp) + 300, 1, 1);

        // Prepare test data 2, which is used to verify that the proposal status is in progress before you can vote
        PowerVoting(paddr).createProposal("Proposal 2", uint248(block.timestamp) + 240, 2, 2);

        // Prepare test data 3 to verify that non-whitelist members cannot vote
        PowerVoting(paddr).createProposal("Proposal 3", uint248(block.timestamp) + 180, 3, 3);

        // Prepare test data 4 to verify that the vote time must be less than or equal to the voting deadline
        PowerVoting(paddr).createProposal("Proposal 4", uint248(block.timestamp) + 120, 4, 4);

        // Prepare test data 5 to verify that repeated voting can only be based on the last voting result.
        PowerVoting(paddr).createProposal("Proposal 5", uint248(block.timestamp) + 300, 5, 5);

    }

    function testVote() public {
        // Enter voting data
        uint256 id = 1;
        string memory voteInfo = "votedata01";
        PowerVoting(paddr).vote(id, voteInfo) ;
        // Voting when the proposal status is not in progress, the vote fails (tlock encrypts the voting data and saves it to ipfs, returns cid and passes cid to the contract)

        // Verify that non-whitelisted members cannot vote (tlock encrypts the voting data and saves it to ipfs, returns cid and passes cid to the contract)

        // Verify that the vote time must be less than or equal to the voting deadline (tlock encrypts the voting data and saves it to ipfs, returns cid and passes cid to the contract)

        // Verification of repeated voting can only be based on the last voting result.
        PowerVoting(paddr).vote(5,"votedata05");
    }

    // Only whitelist members can vote
    function testVote1(address _addr) public returns (bool, bytes memory) {
        uint256 id = 6;
        string memory voteInfo = "006";
        (bool success, bytes memory data) = _addr.delegatecall(abi.encodeWithSignature("vote(uint256, string)", id, voteInfo));
        return (success, data);
    }
}


