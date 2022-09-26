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
    console.log("Event fired: ",voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

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

    console.log(`Voted on proposal ${proposalId} with ${voteWay}`)
    console.log(`Current Proposal State: ${proposalState}`)

}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
