import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying GovernanceToken and waiting for confirmations...")
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`GovernanceToken at ${governanceToken.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceToken.address, [])
  }

  // delegate to the deployer
  log('delegating to the deployer')
  await delegate(governanceToken.address, deployer)

  log('delegated to the deployer')

  
}

// when you deploy the contract, nobody have voting power yet (nobody has token delegated to them)
// we want to delegate the token to the deployer
const delegate = async (governanceTokenAddress: string, delegatee: string) => {
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
  const tx = await governanceToken.delegate(delegatee)
  await tx.wait(1)
  console.log(`Checkpoint for ${delegatee}: ${await governanceToken.numCheckpoints(delegatee)}`)
}

export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "governor"]
