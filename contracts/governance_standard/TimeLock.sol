// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/governance/TimelockController.sol";

// https://goerli.etherscan.io/address/0x93f649eCA8dECebEae10b9D800ae5A28Be1E8EEC#code
contract TimeLock is TimelockController {
  // minDelay is how long you have to wait before executing. When proposing a new proposal, you have to wait for the delay to pass before the proposal can be executed.
  // proposers is the list of addresses that can propose
  // executors is the list of addresses that can execute
  constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors
  ) TimelockController(minDelay, proposers, executors) {}
}