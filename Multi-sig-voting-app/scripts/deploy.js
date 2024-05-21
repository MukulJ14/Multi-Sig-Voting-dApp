// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log(ethers.version);
  const [deployer] = await hre.ethers.getSigners();
  const Voting = await hre.ethers.getContractFactory("Voting");

  console.log("Deploying Voting contract with the account:", deployer.address);

  const votingContract = await Voting.deploy();

  await votingContract.waitForDeployment();

  console.log("Voting contract deployed to:", await votingContract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
