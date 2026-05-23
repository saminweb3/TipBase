'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { base } from 'viem/chains';
import { normalize } from 'viem/ens';

export default function TipBase() {
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState('1');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { isConnected, address } = useAccount();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Resolve Basename or Address
  const resolveRecipient = async (input: string) => {
    if (!input) return null;

    setResolving(true);

    try {
      // If it's already a valid address
      if (isAddress(input)) {
        setResolvedAddress(input);
        setResolving(false);
        return input;
      }

      // If it ends with .base.eth
      if (input.endsWith('.base.eth') || input.endsWith('.basetest.eth')) {
        const normalized = normalize(input);
        // Use viem ENS resolver (works for Basenames on Base)
        const resolved = await fetch(`https://ens-resolver.base.org/${normalized}`)
          .then(res => res.json())
          .then(data => data.address);

        if (resolved) {
          setResolvedAddress(resolved);
          setResolving(false);
          return resolved;
        }
      }

      alert("Could not resolve this name. Please use a valid Basename or wallet address.");
      setResolvedAddress(null);
      setResolving(false);
      return null;
    } catch (error) {
      console.error(error);
      alert("Failed to resolve name. Please try again.");
      setResolving(false);
      return null;
    }
  };

  const sendTip = async () => {
    if (!recipientInput || !amount) {
      alert("Please enter recipient and amount");
      return;
    }

    const toAddress = await resolveRecipient(recipientInput);
    if (!toAddress) return;

    setLoading(true);
    setTxHash(null);

    try {
      const hash = await writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'value', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
          }
        ],
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, parseUnits(amount, 6)],
        chainId: base.id,
      });

      setTxHash(hash);
      alert(`✅ ${amount} USDC sent to ${recipientInput} successfully!\n\nTx: ${hash}`);
    } catch (error: any) {
      console.error(error);
      alert("Transaction failed. Make sure you approved USDC and have enough balance.");
    }
    setLoading(false);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-5 max-w-md mx-auto">
      <div className="flex items-center justify-between py-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0052FF] rounded-2xl flex items-center justify-center">💙</div>
          <h1 className="text-4xl font-bold">TipBase</h1>
        </div>
        <div className="text-sm text-green-400 font-medium">USDC</div>
      </div>

      {!isConnected ? (
        <div className="text-center py-20">
          <h2 className="text-3xl font-semibold mb-3">Welcome to TipBase</h2>
          <p className="text-gray-400 mb-10">Send USDC tips using Basename or address</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#0052FF] hover:bg-blue-600 py-5 rounded-3xl text-xl font-semibold"
          >
            Connect Base Profile
          </button>
        </div>
      ) : (
        <div className="space-y-8 pt-8">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Recipient</label>
            <input
              type="text"
              placeholder="vitalik.base.eth or 0x..."
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 text-lg focus:border-[#0052FF]"
            />
            {resolvedAddress && (
              <p className="text-xs text-green-400 mt-2">✓ Resolved to: {resolvedAddress.slice(0,6)}...{resolvedAddress.slice(-4)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (USDC)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 text-lg focus:border-[#0052FF]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Message (optional)</label>
            <textarea
              placeholder="Thank you for your support!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 h-28 focus:border-[#0052FF]"
            />
          </div>

          <button
            onClick={sendTip}
            disabled={loading || resolving}
            className="w-full bg-[#0052FF] hover:bg-blue-600 py-6 rounded-3xl text-2xl font-bold disabled:opacity-50"
          >
            {loading ? "Sending..." : resolving ? "Resolving Name..." : `Send ${amount} USDC`}
          </button>

          {txHash && (
            <div className="bg-green-900/30 border border-green-500 p-6 rounded-3xl text-center">
              <p className="text-green-400 text-lg">✅ Tip Sent Successfully!</p>
              <p className="text-xs text-gray-400 mt-3 break-all">Tx: {txHash}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
