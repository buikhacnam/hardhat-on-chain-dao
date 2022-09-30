// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

//https://goerli.etherscan.io/address/0x283F67510e8a18ed962A422Aa317C3D3C134E7Ee#code

//https://goerli.etherscan.io/address/0x2f9156e8911dCCFcfd4d0431d7d67D0d60817d07#code
contract Box is Ownable {
  uint256 private value;

  // Emitted when the stored value changes
  event ValueChanged(uint256 newValue);

  // Stores a new value in the contract
  function store(uint256 newValue) public onlyOwner {
    value = newValue;
    emit ValueChanged(newValue);
  }

  // Reads the last stored value
  function retrieve() public view returns (uint256) {
    return value;
  }
}