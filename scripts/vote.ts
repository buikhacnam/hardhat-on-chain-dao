import * as fs from 'fs'
import { network, ethers } from 'hardhat'
import {
	proposalsFile,
	developmentChains,
	VOTING_PERIOD,
} from '../helper-hardhat-config'
import { moveBlocks } from '../utils/move-blocks'

async function main() {
	const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'))

	// get the first proposalId of the chainID
	const proposalId = proposals[network.config.chainId!.toString()][0]

	// 0 is Aganist, 1 is For, 2 is Abstain
	const voteWay = 1

	const governor = await ethers.getContract('GovernorContract')
	const voteTx = await governor.castVoteWithReason(
		proposalId,
		voteWay,
		'I vote for this proposal'
	)

    const voteTxReceipt = await voteTx.wait(1)
    console.log("Event fired: ",voteTxReceipt.events[0].args.reason) // Event fired:  I vote for this proposal
    const proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`) // Current Proposal State: 1

    /**
     https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/IGovernor.sol
     enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }
     */

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }

    console.log(`Voted on proposal ${proposalId} with ${voteWay}`) // oted on proposal 51508501457481436077634888669578781761098444908194579718864424217340756472817 with 1
    console.log(`Current Proposal State: ${proposalState}`) // Current Proposal State: 1

}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
