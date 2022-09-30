import { ethers, network } from 'hardhat'
import {
	developmentChains,
	VOTING_DELAY,
	proposalsFile,
	FUNC,
	PROPOSAL_DESCRIPTION,
	NEW_STORE_VALUE,
} from '../helper-hardhat-config'
import { moveBlocks } from '../utils/move-blocks'
import * as fs from 'fs'

export async function propose(
	args: any[],
	functionToCall: string,
	proposalDescription: string
) {
	const governor = await ethers.getContract('GovernorContract')
	const box = await ethers.getContract('Box')
	const encodeFunctionData = box.interface.encodeFunctionData(
		functionToCall,
		args
	)
	console.log('Encoded Function Data: ', encodeFunctionData) // 0x6057361d000000000000000000000000000000000000000000000000000000000000004d

	console.log('Proposing...')

	const proposeTx = await governor.propose(
		[box.address], // targets
		[0], // eth values
		[encodeFunctionData], // calldatas: the encoded function data
		proposalDescription // description
	)

    const proposeReceipt = await proposeTx.wait(1)

	// If working on a development chain, we will push forward till we get to the voting period.
	if (developmentChains.includes(network.name)) {
		await moveBlocks(VOTING_DELAY + 1)
	}

    // get proposalId from Event
    const proposalId = proposeReceipt.events[0].args[0]

    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)
    // save the proposalId
    storeProposalId(proposalId)
  
    // The state of the proposal. 1 is not passed. 0 is passed.???????????????
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
  
}

function storeProposalId(proposalId: any) {
    const chainId = network.config.chainId!.toString();
    let proposals:any;
  
    if (fs.existsSync(proposalsFile))  {
        // if there is a proposals.json file, read it
        proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    } else {
        // create an empty object
        proposals = { };

        // create a property 'chainId' and set it to an empty array
        proposals[chainId] = [];
    }   

    // push the proposalId to the array
    proposals[chainId].push(proposalId.toString());

    // write the proposals object to the proposals.json file
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
  }

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
