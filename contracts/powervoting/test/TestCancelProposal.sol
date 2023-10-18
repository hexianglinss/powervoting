// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./PowerVoting.sol";
import "./types.sol";

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


    //  Enter test parameters
    function testCreateProposal1() public {
        // Prepare test data 1 for normal cancellation of voting
        PowerVoting(paddr).createProposal("Proposal 1", uint248(block.timestamp) + 300, 1, 1);

        // Prepare test data 2 to verify msg.sender != proposal.creator cannot cancel voting
        PowerVoting(paddr).createProposal("Proposal 2", uint248(block.timestamp) + 240, 2, 2);

        // Prepare test data 3 to verify that the cancellation time must be less than or equal to the voting deadline
        PowerVoting(paddr).createProposal("Proposal 3", uint248(block.timestamp) + 180, 3, 3);

        // Prepare test data 4 to verify that the proposal can be canceled only when the status is in progress
        PowerVoting(paddr).createProposal("Proposal 4", uint248(block.timestamp) + 120, 4, 4);

        // Prepare test data 5. After calling cancel successfully, whether calling cancel again will be successful
        PowerVoting(paddr).createProposal("Proposal 5", uint248(block.timestamp) + 300, 5, 5);

        // Prepare test data 6 to verify that only the proposal creator can cancel the proposal
        PowerVoting(paddr).createProposal("Proposal 6", uint248(block.timestamp) + 120, 6, 6);
    }

    function testCancelProposal2() public {
        // Cancel proposal
        PowerVoting(paddr).cancelProposal(1);
    }

    // msg.sender != proposal.creator, then cancel the proposal
    function testCancelProposal3() public {
        PowerVoting(paddr).cancelProposal(2);
    }

    // Verify block.timestamp > proposal.expTime, whether cancellation operation is allowed


    // Whether to allow cancellation operations when the proposal status is not in progress ( tlock encrypts the voting data and saves it to ipfs, returns cid and passes cid to the contract)


    // After calling cancel successfully, whether calling cancel again succeed


    // Only the proposal creator can cancel a proposal
    function testCancelProposal4(address _addr) public returns (bool, bytes memory) {
        uint256 id = 6;
        (bool success, bytes memory data) = _addr.delegatecall(abi.encodeWithSignature("cancelProposal(uint256)", id));
        return (success, data);
    }
}




