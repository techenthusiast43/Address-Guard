const fs = require("fs");
const path = require("path");

// Zero-dependency .env loader for root
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
      if (key && val) {
        process.env[key.trim()] = val;
      }
    }
  });
}

require("@nomicfoundation/hardhat-toolbox");

const accounts =
  process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== "your_private_key_here"
    ? [
        process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`,
      ]
    : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    botChain: {
      url: process.env.BOT_RPC_URL || "https://rpc.botchain.ai",
      chainId: Number(process.env.BOT_CHAIN_ID) || 677,
      accounts,
    },
    botChainMainnet: {
      url: "https://rpc.botchain.ai",
      chainId: 677,
      accounts,
    },
    botChainTestnet: {
      url: "https://rpc.bohr.life",
      chainId: 968,
      accounts,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
