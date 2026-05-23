'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { base } from 'viem/chains';

export default function TipBase() {
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState('1');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const resolveRecipient = async (input: string) => {
    if (!input) return null;
    setResolving(true);

    try {
      if (isAddress(input)) {
        setResolvedAddress(input);
        setResolving(false);
        return input;
      }

      if (input.endsWith('.base.eth')) {
        const response = await fetch(`https://ens-resolver.base.org/${input}`);
        const data = await response.json();
        if (data.address) {
          setResolvedAddress(data.address);
          setResolving(false);
          return data.address;
        }
      }

      alert("Could not resolve this Basename. Please use a valid .base.eth or 0x address.");
      setResolving(false);
      return null;
    } catch (error) {
      alert("Failed to resolve name.");
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
      alert(`✅ ${amount} USDC sent successfully to ${recipientInput}`);
    } catch (error: any) {
      console.error(error);
      alert("Transaction failed. Please check your USDC balance.");
    }
    setLoading(false);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading TipBase...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-5 max-w-md mx-auto">
      <div className="flex items-center justify-between py-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0052FF] rounded-2xl flex items-center justify-center">💙</div>
          <h1 className="text-4xl font-bold">TipBase</h1>
        </div>
        <div className="text-green-400">USDC</div>
      </div>

      {!isConnected ? (
        <div className="text-center py-20">
          <h2 className="text-3xl font-semibold mb-3">Welcome to TipBase</h2>
          <p className="text-gray-400 mb-10">Send USDC tips using Basename or address</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#0052FF] py-5 rounded-3xl text-xl font-semibold"
          >
            Connect Base Profile
          </button>
        </div>
      ) : (
        <div className="space-y-8 pt-8">
          {/* Input fields same as before */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Recipient</label>
            <input
              type="text"
              placeholder="vitalik.base.eth or 0x..."
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (USDC)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Message</label>
            <textarea
              placeholder="Thank you!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 h-28"
            />
          </div>

          <button
            onClick={sendTip}
            disabled={loading || resolving}
            className="w-full bg-[#0052FF] py-6 rounded-3xl text-2xl font-bold disabled:opacity-50"
          >
            {loading ? "Sending..." : `Send ${amount} USDC`}
          </button>
        </div>
      )}
    </div>
  );
}
