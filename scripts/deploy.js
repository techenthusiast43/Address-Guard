const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying AddressGuard to network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId || 31337);
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer:", deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "BOT");
  }

  const AddressGuard = await hre.ethers.getContractFactory("AddressGuard");
  const addressGuard = await AddressGuard.deploy();

  await addressGuard.waitForDeployment();
  const contractAddress = await addressGuard.getAddress();

  console.log(">>> AddressGuard successfully deployed to:", contractAddress);
  console.log(">>> Explorer Link: https://scan.bohr.life/address/" + contractAddress);

  // Sync contract address and ABI to frontend if directory exists
  const frontendConfigDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("AddressGuard");
  
  const deployedInfo = {
    address: contractAddress,
    chainId: hre.network.config.chainId || 968,
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendConfigDir, "AddressGuard.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  console.log(">>> Contract config written to frontend/src/contracts/AddressGuard.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

