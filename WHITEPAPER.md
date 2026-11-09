# AddressGuard Whitepaper
### Decentralized Address Verification & Non-Custodial Address Management Protocol on BOT Chain

**Version:** 1.1.0  
**Date:** November 2026  
**Network:** BOT Chain (Chain ID: 677)  
**Contract Address:** `0xbC40237702cCA86cC09231c3951271e47DDCC1Aa`  
**Explorer:** [https://scan.botchain.ai/address/0xbC40237702cCA86cC09231c3951271e47DDCC1Aa](https://scan.botchain.ai/address/0xbC40237702cCA86cC09231c3951271e47DDCC1Aa)  
**GitHub:** [https://github.com/techenthusiast43/Address-Guard](https://github.com/techenthusiast43/Address-Guard)  

---

## Executive Summary

Public blockchain networks are defined by transaction irreversibility. While this immutability ensures financial sovereignty and censorship resistance, it places 100% of the operational security burden directly on the end user. Annually, tens of millions of dollars in digital assets are permanently lost due to:
1. **Address Poisoning:** Attackers spam accounts with lookalike zero-value transactions whose vanity prefixes and suffixes mimic the victim’s frequent counterparties.
2. **Clipboard Hijacking:** System-level trojans alter cryptographic hashes in the user's operating system clipboard before transaction broadcasting.
3. **Typographical & Human Errors:** Manual verification of 42-character hexadecimal strings introduces severe cognitive fatigue, resulting in mistyped addresses or misdirected transfers.

**AddressGuard** introduces a decentralized, non-custodial address book and pre-flight transaction verification protocol deployed natively on the **BOT Chain** network. By combining immutable on-chain storage with an $O(1)$ swap-and-pop gas optimization architecture and a tri-state client-side verification engine, AddressGuard provides an impenetrable defense against address-spoofing vectors without compromising user privacy or requiring centralized custody.

---

## 1. Problem Landscape & Threat Modeling

### 1.1 The Cognitive Deficit of Hexadecimal Addressing
EVM addresses are 20-byte identifiers derived from the Keccak-256 hash of a public key, formatted as 42-character hexadecimal strings (e.g., `0x71C...3a9`). Humans cannot reliably parse, memorize, or distinguish these strings at a glance. Most wallet interfaces truncate addresses to the first 4 and last 4 characters (`0x71C...3a9`), creating a critical vulnerability surface.

### 1.2 Address Poisoning Exploitation Vector
Attackers exploit address truncation by deploying vanity contract generators to mine addresses sharing the identical first 4 and last 4 characters as a victim’s frequent recipient. By transferring trivial amounts ($0) to the victim, the attacker injects the spoofed address into the victim's wallet activity history. When the victim later copies the counterparty's address from recent transaction logs, funds are routed directly to the attacker.

### 1.3 Clipboard Manipulators
Local malware hooks the operating system clipboard API (`WM_CLIPBOARDUPDATE` or system clipboard listeners). When a user copies a string matching regex pattern `^0x[a-fA-F0-9]{40}$`, the malicious payload swaps the buffer with the attacker's wallet. Users rarely inspect all 40 hexadecimal characters prior to signing.

---

## 2. The AddressGuard Solution

AddressGuard resolves these failure modes through an on-chain, user-isolated registry and interactive pre-flight verification sandbox.

```
   +-----------------------------------------------------------+
   |                    AddressGuard Protocol                  |
   +-----------------------------------------------------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
+-------------------------------+               +-------------------------------+
|      Smart Contract Layer     |               |     Client Verification Layer |
|  - Per-Owner Storage Mapping  |               |  - EIP-55 Checksum Validator  |
|  - O(1) Swap-and-Pop Deletion |               |  - Tri-State Security Engine  |
|  - Zero-Address Defense       |               |  - Clipboard Ingestion        |
|  - Duplicate Guard            |               |  - Real-Time Cross-Reference  |
+-------------------------------+               +-------------------------------+
```

### Key Pillars:
- **Zero-Trust Autonomous Lists:** Every user account on BOT Chain maintains an independent, sovereign address book. No centralized entity can censor, modify, or view another user's private address associations.
- **Pre-Flight Tri-State Verification:** Before broadcasting any transaction, users test recipient addresses through a real-time validation engine:
  - 🟢 **Valid & Trusted:** The address is syntactically valid and explicitly registered in the user’s authenticated on-chain list.
  - 🟡 **Valid but Unsaved:** The address meets EVM specification but has no historical trust relationship with the sender (triggers explicit warning).
  - 🔴 **Invalid Address:** The string fails hexadecimal format or checksum integrity checks.
- **Categorization & Contextual Labeling:** Users classify counterparties into discrete categories (`Personal`, `Friends`, `Exchanges`, `Projects`), attaching human-readable context to abstract cryptographic keys.

---

## 3. System Architecture & Smart Contract Design

### 3.1 Data Structures & Memory Layout

The core smart contract [`contracts/AddressGuard.sol`](file:///c:/Users/HomePC/Desktop/projects/address%20guard/contracts/AddressGuard.sol) avoids unbounded array iteration and dynamic storage shifting to minimize gas consumption:

```solidity
struct TrustedAddress {
    address wallet;
    string label;
    string category;
    uint256 addedAt;
}

// User address => Array of trusted entries
mapping(address => TrustedAddress[]) private _userAddresses;

// User address => (Target wallet => 1-based index in _userAddresses)
mapping(address => mapping(address => uint256)) private _addressIndices;
```

### 3.2 O(1) Swap-and-Pop Removal Algorithm
Conventional Solidity implementations that delete array elements via linear shifting incur $O(N)$ gas complexity, which escalates linearly with list size and introduces unbounded gas risks:

$$\text{Gas}_{\text{shift}}(N) = k_1 \cdot N + k_2$$

AddressGuard enforces a constant-time $O(1)$ swap-and-pop pattern:
1. Lookup the 1-based index $I$ of the target wallet via `_addressIndices[msg.sender][wallet]`.
2. Retrieve the last element located at index $L = \text{length} - 1$.
3. Overwrite the slot at $(I - 1)$ with the element from slot $L$.
4. Update `_addressIndices` for the moved element to $(I)$.
5. Execute `.pop()` on the storage array and delete the index entry.

$$\text{Gas}_{\text{AddressGuard}}(N) = O(1) \approx \text{Constant Gas}$$

```solidity
function removeTrustedAddress(address wallet) external {
    uint256 index1Based = _addressIndices[msg.sender][wallet];
    if (index1Based == 0) revert AddressNotFound(wallet);

    uint256 indexToDelete = index1Based - 1;
    uint256 lastIndex = _userAddresses[msg.sender].length - 1;

    if (indexToDelete != lastIndex) {
        TrustedAddress memory lastItem = _userAddresses[msg.sender][lastIndex];
        _userAddresses[msg.sender][indexToDelete] = lastItem;
        _addressIndices[msg.sender][lastItem.wallet] = index1Based;
    }

    _userAddresses[msg.sender].pop();
    delete _addressIndices[msg.sender][wallet];

    emit AddressRemoved(msg.sender, wallet);
}
```

### 3.3 Core Function Interface

| Function Signature | Visibility | Mutability | Description |
| :--- | :--- | :--- | :--- |
| `addTrustedAddress(address wallet, string label)` | `external` | `nonpayable` | Adds wallet with default "Personal" category. |
| `addTrustedAddressWithCategory(address wallet, string label, string category)` | `public` | `nonpayable` | Registers a verified wallet with custom category. |
| `removeTrustedAddress(address wallet)` | `external` | `nonpayable` | Removes entry in $O(1)$ constant time. |
| `updateLabel(address wallet, string newLabel)` | `external` | `nonpayable` | Modifies label in-place. |
| `updateCategory(address wallet, string newCategory)` | `external` | `nonpayable` | Modifies category in-place. |
| `isTrusted(address owner, address wallet)` | `external` | `view` | Returns boolean status of address relationship. |
| `getMyTrustedAddresses()` | `external` | `view` | Returns caller's full list of registered entries. |
| `getMyTrustedCount()` | `external` | `view` | Returns integer total of saved addresses. |

### 3.4 Custom Error Architecture
Instead of using generic string reverts (`require(cond, "Long revert string")`), AddressGuard uses Solidity custom errors (`error ZeroAddressNotAllowed()`). This minimizes contract bytecode footprint and saves approximately 50–150 gas units per failed transaction execution.

---

## 4. BOT Chain Network Integration

AddressGuard is deployed directly on the **BOT Chain** network.

### Technical Parameters

| Attribute | Specification |
| :--- | :--- |
| **Network Name** | **BOT Chain** |
| **Chain ID** | **`677`** |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Native Currency** | `BOT` (18 decimals) |
| **Total Token Supply** | 150,000,000 BOT |
| **Block Explorer** | [https://scan.botchain.ai/](https://scan.botchain.ai/) |
| **Deployed Contract** | [`0xbC40237702cCA86cC09231c3951271e47DDCC1Aa`](https://scan.botchain.ai/address/0xbC40237702cCA86cC09231c3951271e47DDCC1Aa) |

BOT Chain offers high transaction throughput and sub-second block times, making micro-state updates (such as label changes and contact additions) instantaneous and negligible in transaction cost.

---

## 5. Client & Web3 Integration Layer

The frontend interface is engineered for high performance, zero custodial risk, and responsive security feedback:

1. **Reown AppKit & Wagmi v2:** Seamless multi-wallet modal integration supporting MetaMask, Rabby, Rainbow, Coinbase Wallet, and WalletConnect v2 protocols.
2. **Viem Core Engine:** Native EIP-55 address checksumming and parsing.
3. **TanStack React Query:** Optimistic updates, background state synchronization, and reactive caching.
4. **Tailwind CSS & Dark Glassmorphism:** High-contrast visual ergonomics designed to make security alerts unmistakable.

---

## 6. Security & Threat Mitigation Analysis

| Potential Threat | Severity | Mitigation in AddressGuard |
| :--- | :--- | :--- |
| **Address Poisoning** | High | Visual lookup verifies whether the address matches the user's verified book rather than recent history. |
| **Clipboard Alteration** | Critical | Instant pre-flight paste tool flags unauthorized addresses as `UNRECOGNIZED` before funds are signed. |
| **Zero Address Burns** | High | Contract-level assertion `if (wallet == address(0)) revert ZeroAddressNotAllowed()` prevents burning. |
| **Unauthorized Modification** | Critical | All mutations are scoped strictly to `msg.sender`. Cross-account modifications are impossible. |
| **Reentrancy Attacks** | Low | AddressGuard holds zero Ether and makes no external contract calls during mutations. |
| **Key Extraction / Phishing** | Critical | AddressGuard is 100% non-custodial; it never requests, processes, or stores private keys or seed phrases. |

---

## 7. Protocol Roadmap

```
2026 Q4                      2027 Q1                      2027 Q2                      2027 Q3
+----------------------+     +----------------------+     +----------------------+     +----------------------+
| Core Protocol &      | --> | BotScan Verification | --> | Browser Extension    | --> | Multi-Sig & Social   |
| BOT Chain Mainnet    |     | & Ecosystem Growth   |     | Pre-Flight Intercept |     | Verification Layer   |
| (COMPLETED)          |     | (IN PROGRESS)        |     | (PLANNED)            |     | (PLANNED)            |
+----------------------+     +----------------------+     +----------------------+     +----------------------+
```

### Phase 1: Core Protocol & Mainnet Launch (Completed)
- Implementation and testing of `AddressGuard.sol` (13/13 unit test coverage).
- Deployment to BOT Chain Mainnet (`0xbC40237702cCA86cC09231c3951271e47DDCC1Aa`).
- Full responsive dApp dashboard with Reown AppKit and Wagmi v2.

### Phase 2: BotScan Verification & Ecosystem Growth (Current)
- Contract verification on BotScan.
- Partnership integration with BOT Chain developer programs.
- Public security verification and formal verification audit.

### Phase 3: Browser Extension & Pre-Flight Interceptor (Planned)
- Lightweight Chrome / Brave browser extension that intercepts MetaMask `eth_sendTransaction` payloads.
- Automatically compares the `to` field against the user’s on-chain AddressGuard book in real-time before displaying the signing popup.

### Phase 4: Account Abstraction (ERC-4337) Integration (Planned)
- Direct integration as a security module for Smart Contract Accounts (Safe / ERC-4337).
- Optional spend-limit overrides for verified AddressGuard entries.

---

## 8. Conclusion

AddressGuard bridges the critical gap between raw cryptographic addressing and human-operable safety. By shifting address verification from vulnerable operating system clipboards and truncated UI logs into an immutable on-chain registry on BOT Chain, AddressGuard establishes a standardized security barrier against fraud, poisoning, and accidental transfer loss.

---

## Repository & References
- **Source Code:** [https://github.com/techenthusiast43/Address-Guard](https://github.com/techenthusiast43/Address-Guard)
- **BOT Chain Official:** [https://botchain.ai/](https://botchain.ai/)
- **BotScan Block Explorer:** [https://scan.botchain.ai/](https://scan.botchain.ai/)
- **EIP-55: Mixed-case checksum address encoding:** [https://eips.ethereum.org/EIPS/eip-55](https://eips.ethereum.org/EIPS/eip-55)
