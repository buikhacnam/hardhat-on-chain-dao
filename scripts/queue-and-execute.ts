import { ethers, network } from "hardhat"
import { SourceLocation } from 'hardhat/internal/hardhat-network/stack-traces/model'
import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  developmentChains,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"


//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/extensions/IGovernorTimelock.sol
export async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const functionToCall = FUNC
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)

    // get description hash on chain from proposal
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    console.log("Description Hash: ", descriptionHash) // 0x037dafdb605b77c51dd1e7239e3a9d71a9356e716c6af054ccda04745d440062

    console.log("queueing...")
    const governor = await ethers.getContract("GovernorContract")
    const queueTx = await governor.queue(
        [box.address], // targets
        [0], // eth values
        [encodedFunctionCall], // calldatas: the encoded function data
        descriptionHash // description hash
    )
    
    await queueTx.wait(1)

    console.log("now we're waiting for MIN_DELAY to over...")
    // when something is queued, it's MIN_DELAY before it can be executed

    // speed up time in development
    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1) // plus one to be safe
        await moveBlocks(1)
    }
    console.log("min delay has passed, executing...")

    const executeTx = await governor.execute(
        [box.address], // targets
        [0], // eth values
        [encodedFunctionCall], // calldatas: the encoded function data
        descriptionHash // description hash
    )

    await executeTx.wait(1)

    console.log("executed!")

    // check if the governor has updated the Box contract
    const boxValue = await box.retrieve()

    console.log("New Box value: ", boxValue.toString()) // New Box value:  77

}


queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
