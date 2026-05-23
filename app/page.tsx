'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'viem/chains';

export default function TipBase() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  // ←←← CHANGE THIS AFTER DEPLOYING YOUR CONTRACT ←←←
  const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

  const sendTip = async () => {
    if (!recipient || !amount) {
      alert("Please enter recipient and amount");
      return;
    }

    setLoading(true);
    setTxHash(null);

    try {
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'sendTip',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'message', type: 'string' }
            ],
            outputs: [],
          }
        ],
        functionName: 'sendTip',
        args: [recipient as `0x${string}`, message || "Thank you!"],
        value: parseEther(amount),
        chainId: base.id,
      });

      // Wait a bit for hash to be available
      setTimeout(() => {
        if (hash) {
          setTxHash(hash);
          alert(`✅ Tip sent successfully!\n\nTransaction Hash:\n${hash}`);
        }
      }, 2000);

    } catch (error: any) {
      console.error(error);
      alert("Transaction failed. Make sure your wallet is connected and you have enough ETH for gas.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0052FF] rounded-2xl flex items-center justify-center">
            💙
          </div>
          <h1 className="text-4xl font-bold">TipBase</h1>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-20">
          <h2 className="text-3xl font-semibold mb-3">Welcome to TipBase</h2>
          <p className="text-gray-400 mb-10">Send tips to anyone using Basename or wallet address</p>
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
            <label className="block text-sm text-gray-400 mb-2">Recipient (Basename or Address)</label>
            <input
              type="text"
              placeholder="vitalik.base.eth or 0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-5 text-lg focus:border-[#0052FF]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (ETH)</label>
            <input
              type="number"
              step="0.0001"
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
            disabled={loading}
            className="w-full bg-[#0052FF] hover:bg-blue-600 py-6 rounded-3xl text-2xl font-bold disabled:opacity-50"
          >
            {loading ? "Sending Tip..." : `Send ${amount} ETH`}
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
