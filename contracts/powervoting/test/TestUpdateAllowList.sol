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
    }

    //  Update AllowList
    function testUpdateAllowList() public {
        address[] memory addr = new address[](1);
        addr[0] = address(this);
        PowerVoting(paddr).updateProposalAllowList(addr);
    }

    // Only contract deployers can update the whitelist
    function testCount1(address _addr) public returns (bool, bytes memory) {
        address[] memory addrList = new address[](1);
        addrList[0] = address(this);
        (bool success, bytes memory data) = _addr.delegatecall(abi.encodeWithSignature("updateProposalAllowList(address[])", addrList));
        return (success, data);
    }
}