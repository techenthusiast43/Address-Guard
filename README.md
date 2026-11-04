# AddressGuard 🛡️ — Trusted Wallet Address Manager

**AddressGuard** is a lightweight, non-custodial Web3 dApp built on the **BOT Chain** network. It functions as a personal on-chain address book where users can save, label, organize, search, and verify destination wallet addresses before transferring cryptocurrency.

---

## 🌐 Network Parameters (BOT Chain Testnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BOT Chain Testnet (Bohr) |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` (18 Decimals) |
| **Total Supply** | 150 Million |
| **Block Explorer** | [https://scan.bohr.life/](https://scan.bohr.life/) |
| **Deployed Contract** | [`0xB42DD3529DEF5c2e59142ffCF3a535c8a2f4CaEB`](https://scan.bohr.life/address/0xB42DD3529DEF5c2e59142ffCF3a535c8a2f4CaEB) |

---

## ⚡ Core Features

1. **EVM Wallet Connection**: Connect using MetaMask or other compatible wallets via **Reown AppKit** (`@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`).
2. **Add Trusted Addresses**: Save wallet addresses with custom labels (e.g. *"Alice Cold Vault"*, *"Binance Deposit"*).
3. **Categories**: Classify addresses into **Personal**, **Friends**, **Exchanges**, and **Projects**.
4. **Per-Wallet Isolation**: Each wallet manages strictly its own private list on-chain.
5. **Duplicate & Zero-Address Protection**: Built-in smart contract validation rejects zero addresses (`address(0)`), empty labels, and duplicate entries.
6. **Gas-Efficient $O(1)$ Removals**: Implemented using the swap-and-pop pattern to ensure low and predictable transaction gas fees.
7. **Address Verification Tool**:
   - Paste any recipient address to perform real-time EIP-55 format checking and address-book lookup.
   - 🟢 **Valid & Trusted**: Displays verified green badge, category, custom label, and save date.
   - 🟡 **Valid but Not Saved**: Displays warning with a quick 1-click shortcut to add the address.
   - 🔴 **Invalid Address**: Flags malformed addresses to prevent accidental fund loss.
8. **Real-Time Search & Category Filters**: Filter saved addresses instantly by text or category tabs.
9. **Transaction Feedback**: Real-time status toasts with direct links to BohrScan transaction hashes.
10. **1-Click Copy**: Instant address clipboard copy with visual feedback.

---

## 📂 Project Structure

```
address-guard/
├── contracts/
│   └── AddressGuard.sol           # Solidity smart contract
├── test/
│   └── AddressGuard.test.js       # Hardhat test suite (13/13 passing)
├── scripts/
│   └── deploy.js                  # Deployment script for BOT Chain
├── hardhat.config.js              # Hardhat configuration with BOT Chain network
├── package.json                   # Root dependencies (Hardhat, Toolbox)
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json               # Reown AppKit, Wagmi v2, Viem, TanStack Query
│   └── src/
│       ├── App.jsx                # Main dApp layout
│       ├── main.jsx               # App entrypoint (Wagmi + React Query)
│       ├── index.css              # Dark theme styling & scrollbars
│       ├── config/
│       │   ├── chain.js           # BOT Chain (Chain ID: 968) definition
│       │   └── web3.js            # Reown AppKit & WagmiAdapter setup
│       ├── contracts/
│       │   └── AddressGuard.json  # Contract ABI & active address
│       ├── hooks/
│       │   └── useAddressGuard.js # Web3 reactive state hook
│       └── components/
│           ├── Header.jsx         # Navigation, network badge, wallet connect
│           ├── StatsBar.jsx       # Category counts & total summary
│           ├── AddressVerificationPanel.jsx # Verification sandbox
│           ├── AddressList.jsx    # Search, category filter, list & edit
│           ├── AddAddressModal.jsx# Form to save address to BOT Chain
│           └── TxNotification.jsx # Live transaction toast with BohrScan links
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### 1. Compile & Test Smart Contract

```bash
# In the project root:
npm install

# Run the test suite:
npx hardhat test
```

### 2. Deploy to BOT Chain Testnet

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your deployer private key:
   ```env
   BOT_RPC_URL=https://rpc.bohr.life
   PRIVATE_KEY=your_private_key_without_0x
   ```
3. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network botChain
   ```
   *The script will deploy `AddressGuard.sol` and automatically synchronize the deployed address and ABI to `frontend/src/contracts/AddressGuard.json`.*

---

### 3. Run the Frontend

```bash
cd frontend

# Install dependencies:
npm install

# Start Vite dev server:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Best Practices

- **Zero-Storage of Private Keys**: AddressGuard never accesses, requests, or stores private keys or seed phrases.
- **Client-Side Sanitization**: Addresses are sanitized and checksummed with `viem.getAddress()` before submitting on-chain.
- **Contract Boundary**: Only `msg.sender` can view or mutate their own address list.

