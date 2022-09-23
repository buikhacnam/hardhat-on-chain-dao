import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, ADDRESS_ZERO } from "../helper-hardhat-config"
import { ethers } from "hardhat"
/**
the governor contract should be the only one that proposes things to the time lock and then anybody should be able to execute.

The way it works is that say hey the governance contract proposes something to the time lock once it's in the time lock and it waits that period anybody can go ahead and execute it 


 */

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  log("----------------------------------------------------")
  log("Setting up contracts for roles...")
  // would be great to use multicall here...
  // only the governor can propose to the time lock

  // timelock is like the president
 // everything goes to the house of representatives (governor) 
 //and then the house of representatives votes on it and then the president can execute it
 // the president say yes sure I'll execute that, we just need to wait for the MIN_DELAY


 // Get the bytes codes of different roles: 
 // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/TimelockController.sol
  const proposerRole = await timeLock.PROPOSER_ROLE()
  const executorRole = await timeLock.EXECUTOR_ROLE()
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

  console.log({
    proposerRole,
    executorRole,
    adminRole,
  })

  /*
{
  proposerRole: '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1',
  executorRole: '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
  adminRole: '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5'
}

  */


// right now the deployer account is the admin of the timelock which is not good, we dont want anyone to be the timelock admin


// We will need to fix these roles
  const proposerTx = await timeLock.grantRole(proposerRole, governor.address) // alright governor you're the only one who can propose to the time lock
  await proposerTx.wait(1)
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO) // no one can execute anything which means everybody can execute
  await executorTx.wait(1)

  // rightnow, the deployer is the admin of the timelock. But after we give everybody the access to execute, we want to remove the deployer as the admin of the timelock
  const revokeTx = await timeLock.revokeRole(adminRole, deployer) 
  await revokeTx.wait(1)
  // Guess what? Now, anything the timelock wants to do has to go through the governance process!
  // and nobody owns the timelock anymore
  // now it's impossible to change the timelock without going through the governance process
}

export default setupContracts
setupContracts.tags = ["all", "setup"]