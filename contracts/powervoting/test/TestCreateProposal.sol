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

    function testCreateProposal1() public {
        // 1. Enter test parameters
        string memory proposalCid = "proposal001";
        uint248 expTime = uint248(block.timestamp) + 180;
        uint256 chainId = 1;
        uint256 proposalType = 1;

        // 2. Create proposal
        PowerVoting(paddr).createProposal(proposalCid, expTime, chainId, proposalType);

        // 3. Check whether the creation result matches the input parameters
    }

    // Only whitelist members can create proposals
    function testCreateProposal2(address _addr) public returns (bool, bytes memory) {
        string memory proposalCid = "proposal002";
        uint248 expTime = uint248(block.timestamp) + 240;
        uint256 chainId = 2;
        uint256 proposalType = 2;
        (bool success, bytes memory data) = _addr.delegatecall(abi.encodeWithSignature("createProposal(string, uint248, uint256, uint256)", proposalCid, expTime, chainId, proposalType));
        return (success, data);
    }
}

