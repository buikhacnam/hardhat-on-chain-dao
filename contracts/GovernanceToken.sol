// SPDX-Lisence-Identifier: MIT
pragma solidity ^0.8.17;

// Importing OpenZeppelin's ERC20 Votes
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Votes.sol
// The reason we need to use the ERC20Votes is because we need to use the ability to snapshot the token balances of the users at a certain point in time / block. 
// This is needed for the governance token to work properly. It prevents someone from voting with a token that they just bought and then selling it right after. 
// This is a common attack vector in DeFi.

contract GovernanceToken is ERC20Votes {
    // s_maxSupply 1 million tokens
    uint256 public s_maxSupply = 1000000 * 10**18;

    constructor()
        ERC20("GovernanceToken", "GOV")
        ERC20Permit("GovernanceToken")
    {
        _mint(msg.sender, s_maxSupply);
    }

    // The functions below are overrides required by Solidity.
    // To make sure the snapshot is updated

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
