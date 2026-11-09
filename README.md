# AddressGuard 🛡️ — Trusted Wallet Address Manager

**AddressGuard** is a lightweight, non-custodial Web3 dApp built natively on the **BOT Chain** network. It functions as a personal on-chain address book where users can save, label, organize, search, and verify destination wallet addresses before transferring cryptocurrency.

---

## 🌐 Network Parameters (BOT Chain)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | **BOT Chain** |
| **Chain ID** | **`677`** |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Native Token** | `BOT` (18 Decimals) |
| **Total Supply** | 150 Million |
| **Block Explorer** | [https://scan.botchain.ai/](https://scan.botchain.ai/) |
| **Deployed Contract** | [`0xbC40237702cCA86cC09231c3951271e47DDCC1Aa`](https://scan.botchain.ai/address/0xbC40237702cCA86cC09231c3951271e47DDCC1Aa) |

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
9. **Transaction Feedback**: Real-time status toasts with direct links to BotScan transaction hashes.
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
├── hardhat.config.js              # Hardhat configuration (Chain ID: 677)
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
│       │   ├── chain.js           # BOT Chain (Chain ID: 677) definition
│       │   └── web3.js            # Reown AppKit & WagmiAdapter setup
│       ├── contracts/
│       │   └── AddressGuard.json  # Mainnet Contract ABI & live address
│       ├── hooks/
│       │   └── useAddressGuard.js # Web3 reactive state hook
│       └── components/
│           ├── Header.jsx         # Navigation, network badge, wallet connect
│           ├── StatsBar.jsx       # Category counts & total summary
│           ├── AddressVerificationPanel.jsx # Verification sandbox
│           ├── AddressList.jsx    # Search, category filter, list & edit
│           ├── AddAddressModal.jsx# Form to save address to BOT Chain
│           └── TxNotification.jsx # Live transaction toast with BotScan links
└── README.md
```

---

## 🚀 Getting Started

### 1. Compile & Test Smart Contract

```bash
# Run the test suite:
npx hardhat test
```

### 2. Deploy to BOT Chain

```bash
npx hardhat run scripts/deploy.js --network botChain
```

### 3. Run the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
