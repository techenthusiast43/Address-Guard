import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { isAddress, getAddress } from 'viem';
import contractData from '../contracts/AddressGuard.json';
import { botChain, localhostChain } from '../config/chain';

const STORAGE_KEY_CONTRACT_ADDR = 'addressguard_contract_address';

const NETWORK_CONTRACTS = {
  677: '0xbC40237702cCA86cC09231c3951271e47DDCC1Aa',
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
};

export function useAddressGuard() {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isLocalhost = chainId === localhostChain.id;
  const isCorrectNetwork = chainId === botChain.id || isLocalhost;
  const explorerUrl = isLocalhost ? '' : 'https://scan.botchain.ai';

  // Automatically bind contract address to active network (or localStorage override)
  const [contractAddress, setContractAddressState] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEY_CONTRACT_ADDR) ||
      NETWORK_CONTRACTS[chainId] ||
      contractData.address
    );
  });

  useEffect(() => {
    const custom = localStorage.getItem(STORAGE_KEY_CONTRACT_ADDR);
    if (!custom && NETWORK_CONTRACTS[chainId]) {
      setContractAddressState(NETWORK_CONTRACTS[chainId]);
    }
  }, [chainId]);

  const setContractAddress = (newAddr) => {
    if (isAddress(newAddr)) {
      const formatted = getAddress(newAddr);
      setContractAddressState(formatted);
      localStorage.setItem(STORAGE_KEY_CONTRACT_ADDR, formatted);
    }
  };

  // Wagmi contract write
  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for receipt
  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track latest notification state
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (isWritePending) {
      setNotification({
        type: 'pending',
        title: 'Transaction Submitted',
        message: 'Awaiting signature or confirmation...',
        hash: null,
      });
    } else if (txHash && isTxConfirming) {
      setNotification({
        type: 'confirming',
        title: 'Mining on BOT Chain',
        message: 'Transaction is being confirmed on block...',
        hash: txHash,
      });
    } else if (isTxSuccess && txHash) {
      setNotification({
        type: 'success',
        title: 'Transaction Confirmed',
        message: 'Your address book was successfully updated!',
        hash: txHash,
      });
      refetchAddresses();
    } else if (writeError || receiptError) {
      const err = writeError || receiptError;
      setNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: err?.shortMessage || err?.message || 'Transaction reverted',
        hash: txHash,
      });
    }
  }, [isWritePending, txHash, isTxConfirming, isTxSuccess, writeError, receiptError]);

  // Read user's trusted addresses
  const {
    data: rawAddresses,
    isLoading: isReading,
    refetch: refetchAddresses,
    error: readError,
  } = useReadContract({
    address: isAddress(contractAddress) ? getAddress(contractAddress) : undefined,
    abi: contractData.abi,
    functionName: 'getMyTrustedAddresses',
    account: userAddress,
    query: {
      enabled: isConnected && isAddress(contractAddress) && isCorrectNetwork,
      refetchInterval: 8000,
    },
  });

  // Format array of addresses
  const addresses = useMemo(() => {
    if (!rawAddresses || !Array.isArray(rawAddresses)) return [];
    return rawAddresses.map((item) => ({
      wallet: item.wallet,
      label: item.label,
      category: item.category || 'Personal',
      addedAt: Number(item.addedAt) * 1000, // convert sec to ms
    }));
  }, [rawAddresses]);

  // Add trusted address
  const addAddress = useCallback(
    async (wallet, label, category = 'Personal') => {
      if (!isConnected) throw new Error('Wallet not connected');
      if (!isAddress(wallet)) throw new Error('Invalid EVM address format');
      if (!label || label.trim() === '') throw new Error('Label cannot be empty');

      resetWrite();
      return await writeContractAsync({
        address: getAddress(contractAddress),
        abi: contractData.abi,
        functionName: 'addTrustedAddress',
        args: [getAddress(wallet), label.trim(), category],
      });
    },
    [isConnected, contractAddress, writeContractAsync, resetWrite]
  );

  // Remove trusted address
  const removeAddress = useCallback(
    async (wallet) => {
      if (!isConnected) throw new Error('Wallet not connected');
      if (!isAddress(wallet)) throw new Error('Invalid EVM address');

      resetWrite();
      return await writeContractAsync({
        address: getAddress(contractAddress),
        abi: contractData.abi,
        functionName: 'removeTrustedAddress',
        args: [getAddress(wallet)],
      });
    },
    [isConnected, contractAddress, writeContractAsync, resetWrite]
  );

  // Update label
  const updateLabel = useCallback(
    async (wallet, newLabel) => {
      if (!isConnected) throw new Error('Wallet not connected');
      if (!isAddress(wallet)) throw new Error('Invalid EVM address');
      if (!newLabel || newLabel.trim() === '') throw new Error('Label cannot be empty');

      resetWrite();
      return await writeContractAsync({
        address: getAddress(contractAddress),
        abi: contractData.abi,
        functionName: 'updateLabel',
        args: [getAddress(wallet), newLabel.trim()],
      });
    },
    [isConnected, contractAddress, writeContractAsync, resetWrite]
  );

  // Update category
  const updateCategory = useCallback(
    async (wallet, newCategory) => {
      if (!isConnected) throw new Error('Wallet not connected');
      if (!isAddress(wallet)) throw new Error('Invalid EVM address');

      resetWrite();
      return await writeContractAsync({
        address: getAddress(contractAddress),
        abi: contractData.abi,
        functionName: 'updateCategory',
        args: [getAddress(wallet), newCategory],
      });
    },
    [isConnected, contractAddress, writeContractAsync, resetWrite]
  );

  // Address verification tool logic
  const verifyAddress = useCallback(
    (inputAddress) => {
      if (!inputAddress || inputAddress.trim() === '') {
        return { status: 'EMPTY' };
      }

      const cleanInput = inputAddress.trim();

      // Check format
      if (!isAddress(cleanInput)) {
        return {
          status: 'INVALID',
          message: 'Invalid EVM format. Must be a 42-character hexadecimal string beginning with 0x.',
        };
      }

      const normalized = getAddress(cleanInput);

      // Check if in saved trusted addresses
      const match = addresses.find(
        (a) => a.wallet.toLowerCase() === normalized.toLowerCase()
      );

      if (match) {
        return {
          status: 'TRUSTED',
          message: 'Valid & Trusted address in your address book.',
          address: normalized,
          entry: match,
        };
      }

      return {
        status: 'NOT_SAVED',
        message: 'Valid EVM address, but NOT saved in your trusted list.',
        address: normalized,
      };
    },
    [addresses]
  );

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    userAddress,
    isConnected,
    isCorrectNetwork,
    chainId,
    explorerUrl,
    switchChain: () => switchChain?.({ chainId: botChain.id }),
    contractAddress,
    setContractAddress,
    addresses,
    isLoading: isReading,
    refetchAddresses,
    addAddress,
    removeAddress,
    updateLabel,
    updateCategory,
    verifyAddress,
    notification,
    dismissNotification,
    isWritePending: isWritePending || isTxConfirming,
    latestTxHash: txHash,
  };
}

