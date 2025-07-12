import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useConnect, useDisconnect } from 'wagmi';
import { HINT_BUNDLE_WORD_COUNT, HINT_BUNDLE_CATEGORY_COUNT, HINT_BUNDLE_COST } from '../constants.ts';
import { hintPayerContractAddress, hintPayerContractAbi, usdcContractAddress, usdcContractAbi } from '../contracts.ts';
import { LoadingSpinner } from './common.tsx';
import { parseUnits, formatUnits } from 'viem';
import { injected } from 'wagmi/connectors'

interface HintPurchaseModalProps {
    onPurchaseSuccess: () => void;
    onCancel: () => void;
}

type PurchaseStep = 'idle' | 'connecting' | 'checking_allowance' | 'approving' | 'approved' | 'purchasing' | 'success' | 'error';

const HintPurchaseModal: React.FC<HintPurchaseModalProps> = ({ onPurchaseSuccess, onCancel }) => {
    const { address, isConnected, chain } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: hash, writeContractAsync, error: writeError } = useWriteContract();
    
    const [step, setStep] = useState<PurchaseStep>('idle');
    const [error, setError] = useState<string | null>(null);

    const hintPrice = parseUnits(HINT_BUNDLE_COST.toString(), 6); // USDC has 6 decimals

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: usdcContractAddress,
        abi: usdcContractAbi,
        functionName: 'allowance',
        args: [address!, hintPayerContractAddress],
        query: { enabled: isConnected },
    });
    
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if(isConfirming) {
            if (step === 'approving') {
                 // stay in approving step
            } else if (step === 'purchasing') {
                 // stay in purchasing step
            }
        } else if (isConfirmed) {
            if (step === 'approving') {
                setStep('approved');
            } else if (step === 'purchasing') {
                setStep('success');
                setTimeout(() => onPurchaseSuccess(), 1500);
            }
        }
    }, [isConfirming, isConfirmed, step, onPurchaseSuccess]);
    
    useEffect(() => {
        if(writeError) {
            setError(writeError.message.split('\n')[0]);
            setStep('error');
        }
    }, [writeError]);

    const handlePurchase = async () => {
        setError(null);
        setStep('checking_allowance');
        
        await refetchAllowance();

        if (allowance !== undefined && allowance < hintPrice) {
            setStep('approving');
            try {
                await writeContractAsync({
                    address: usdcContractAddress,
                    abi: usdcContractAbi,
                    functionName: 'approve',
                    args: [hintPayerContractAddress, hintPrice],
                });
            } catch (e) { /* error is handled by useEffect */ }
        } else {
             setStep('approved'); // Already has enough allowance
        }
    };
    
    useEffect(() => {
        if(step === 'approved') {
            const purchase = async () => {
                setStep('purchasing');
                try {
                     await writeContractAsync({
                        address: hintPayerContractAddress,
                        abi: hintPayerContractAbi,
                        functionName: 'payForHints',
                        args: [],
                    });
                } catch(e) { /* error is handled by useEffect */ }
            }
            purchase();
        }
    }, [step, writeContractAsync]);

    const renderContent = () => {
        if (!isConnected) {
            return (
                <>
                    <h2 className="text-2xl font-bold mb-3">Connect Wallet</h2>
                    <p className="text-gray-300 mb-6">
                        Connect your wallet to purchase hints. This app uses the Base network.
                    </p>
                    <button
                        onClick={() => connect({ connector: injected() })}
                        className="w-full py-3 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                    >
                        Connect Wallet
                    </button>
                </>
            );
        }

        switch (step) {
            case 'success':
                return (
                    <div className="h-48 flex flex-col justify-center items-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <p className="font-bold text-xl">Purchase Successful!</p>
                        <p className="text-gray-400">Your hints have been added.</p>
                    </div>
                );
            case 'approving':
                return <div className="h-48 flex flex-col justify-center"><LoadingSpinner text={isConfirming ? 'Waiting for approval confirmation...' : 'Please approve USDC in your wallet...'} /></div>;
            case 'purchasing':
                 return <div className="h-48 flex flex-col justify-center"><LoadingSpinner text={isConfirming ? 'Waiting for transaction confirmation...' : 'Please confirm purchase in your wallet...'} /></div>;
            case 'error':
                 return (
                    <div className="h-48 flex flex-col justify-center items-center text-center">
                        <p className="font-bold text-red-500">Transaction Failed</p>
                        <p className="text-xs text-gray-400 break-words my-2">{error}</p>
                        <button onClick={() => setStep('idle')} className="px-4 py-1 mt-2 rounded-full bg-gray-600 text-white font-semibold">Try Again</button>
                    </div>
                 );
            default:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-3">Out of Hints?</h2>
                        <p className="text-gray-300 mb-2">
                            Get <span className="font-bold text-white">{HINT_BUNDLE_WORD_COUNT} Word Hints</span> and <span className="font-bold text-white">{HINT_BUNDLE_CATEGORY_COUNT} Category Hint</span> for <span className="font-bold text-white">{HINT_BUNDLE_COST} USDC</span> on Base.
                        </p>
                        <p className="text-xs text-gray-500 mb-6">
                            Connected to {chain?.name} as {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onCancel}
                                className="w-full py-3 rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchase}
                                className="w-full py-3 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onCancel}>
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-lg transform transition-all relative" onClick={(e) => e.stopPropagation()}>
                 <button onClick={onCancel} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default HintPurchaseModal;