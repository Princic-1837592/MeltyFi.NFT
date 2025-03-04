/**
 * Deploys a contract with the given name and arguments, using the provided deployer as the signer.
 *
 * @param {string} contractName - The name of the contract to deploy.
 * @param {any[]} args - The arguments to pass to the contract constructor.
 * @param {import('hardhat/types').Signer} deployer - The signer to use for deploying the contract.
 * @return {Promise<import('hardhat/types').Contract>} The deployed contract instance.
 */
async function deployContract(contractName, args, deployer) {

	console.log(`${contractName} is deploying...`);
	console.log(`Deployer address: ${deployer.address}`);

	const Contract = await hre.ethers.getContractFactory(contractName);
	const contract = await Contract.deploy(...args);
	await contract.deployed();

	console.log(`Contract address: ${contract.address}`);
	console.log(`Transaction hash: ${contract.deployTransaction.hash}`);
	console.log(`${contractName} deployed`);
	console.log();

	return contract;
}

/**
 * Deploys the following contracts in the following order:
 * 1. ChocoChip: a contract representing the ERC20 governance token of the ecosystem.
 * 2. WonkaBar: a contract representing the ERC1155 utility token of the ecosystem.
 * 3. TimelockController: a contract that controls the timelock of the MeltyFiDAO contract.
 * 4. MeltyFiDAO: a contract representing the MeltyFi DAO, a decentralized autonomous organization (DAO).
 *                It is initialized with the ChocoChip and TimelockController contracts.
 * 5. MeltyFiNFT: a contract representing the MeltyFiNFT protocol.
 *                It is initialized with the ChocoChip, WonkaBar, and MeltyFiDAO contracts.
 * After all the contracts are deployed, transfers the ownership of the ChocoChip and WonkaBar contracts
 * to the MeltyFiNFT contract.
 */
async function main() {

	const [deployer, ...otherAccounts] = await hre.ethers.getSigners();

	const contractChocoChip = await deployContract('ChocoChip', [], deployer);

	const contractWonkaBar = await deployContract('WonkaBar', [], deployer);

	const contractTimelockController = await deployContract('TimelockController', [3600, [], [], deployer.address], deployer);
	const contractMeltyFiDAO = await deployContract('MeltyFiDAO', [contractChocoChip.address, contractTimelockController.address], deployer);

	const contractMeltyFiNFT = await deployContract('MeltyFiNFT', [contractChocoChip.address, contractWonkaBar.address, contractMeltyFiDAO.address], deployer);

	console.log(`transferOwnership of ChocoChip contract from deployer to MeltyFiNFT contract...`);
	const result1 = await contractChocoChip.transferOwnership(contractMeltyFiNFT.address);
	console.log(`Transaction hash: ${result1.hash}`);
	console.log(`Transaction successed`);
	console.log();

	console.log(`transferOwnership of WonkaBar contract from deployer to MeltyFiNFT contract...`);
	const result2 = await contractWonkaBar.transferOwnership(contractMeltyFiNFT.address);
	console.log(`Transaction hash: ${result2.hash}`);
	console.log(`Transaction successed`);
	console.log();

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

