const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const chainId = Number(hre.network.config.chainId) || 677;
  const isMainnet = chainId === 677;
  const explorerUrl = isMainnet
    ? "https://scan.botchain.ai"
    : "https://scan.bohr.life";

  console.log("====================================================");
  console.log("Deploying AddressGuard to:", hre.network.name);
  console.log("Target Chain ID:", chainId, isMainnet ? "(BOT Chain MAINNET)" : "(Testnet)");
  console.log("Explorer:", explorerUrl);
  console.log("====================================================");

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", hre.ethers.formatEther(balance), "BOT");
  }

  const AddressGuard = await hre.ethers.getContractFactory("AddressGuard");
  const addressGuard = await AddressGuard.deploy();

  await addressGuard.waitForDeployment();
  const contractAddress = await addressGuard.getAddress();

  console.log("\n>>> SUCCESS! AddressGuard deployed to:", contractAddress);
  console.log(">>> Explorer Link:", `${explorerUrl}/address/${contractAddress}`);

  // Sync contract address and ABI to frontend
  const frontendConfigDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("AddressGuard");

  const deployedInfo = {
    address: contractAddress,
    chainId: chainId,
    explorer: explorerUrl,
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendConfigDir, "AddressGuard.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  // Also update frontend/.env
  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env");
  if (fs.existsSync(frontendEnvPath)) {
    let fe = fs.readFileSync(frontendEnvPath, "utf-8");
    if (fe.includes("VITE_CONTRACT_ADDRESS=")) {
      fe = fe.replace(/VITE_CONTRACT_ADDRESS=.*/, `VITE_CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      fe += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(frontendEnvPath, fe);
  }

  console.log(">>> Contract config written to frontend/src/contracts/AddressGuard.json and frontend/.env\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
