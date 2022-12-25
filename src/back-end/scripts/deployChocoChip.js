const { ethers } = require("hardhat");

const contractName = "ChocoChip";

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log(`Deploying ${contractName} with the account: ${deployer.address}`);

	console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);

	const Contract = await ethers.getContractFactory(contractName);
	const contract = await Contract.deploy();

	console.log(`Token address: ${contract.address}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
