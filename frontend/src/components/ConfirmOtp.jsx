'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ConfirmOtp() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        const savedEmail = sessionStorage.getItem('resetEmail');
        if (!savedEmail) {
            router.push('/forgot-password');
            return;
        }
        setEmail(savedEmail);
    }, [router]);

    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (!canResend) return;
        setResending(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3000/relayapi', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    endpoint: 'user-forgotpass',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success === 1) {
                toast.success('OTP resent!', { position: 'top-right' });
                setCountdown(60);
                setCanResend(false);
                setOtp('');
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch {
            setError('Server error. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.trim() === '') {
            setError('OTP is required');
            return;
        }
        if (!/^\d+$/.test(otp)) {
            setError('OTP must be numeric');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/relayapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    endpoint: 'user-confirm-otp',
                },
                body: JSON.stringify({ email, otp: Number(otp) }),
            });

            const data = await response.json();

            if (data.success === 1) {
                toast.success('OTP verified!', { position: 'top-right' });
                sessionStorage.setItem('resetToken', data.token);
                router.push('/reset-password');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch {
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="relative bg-white flex flex-col justify-center px-24">
                <div className="absolute top-6 left-6">
                    <img src="/logo.png" className="h-16" alt="Logo" />
                </div>

                <div className="max-w-md ms-24">
                    <button
                        onClick={() => router.push('/forgot-password')}
                        className="flex items-center gap-2 text-gray-500 text-sm mb-8 hover:text-blue-600 transition"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Verify OTP
                    </h1>
                    <p className="text-gray-500 mb-2">
                        Enter the OTP sent to <span className="font-medium text-gray-700">{email}</span>
                    </p>
                    <p className="text-gray-400 text-sm mb-10">
                        Check your inbox (and spam folder).
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">
                                OTP <span className="text-red-500 text-[16px]">*</span>
                            </label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                maxLength={8}
                                value={otp}
                                onChange={(e) => { setOtp(e.target.value); setError(''); }}
                                placeholder="Enter OTP"
                                className={`text-black w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 tracking-widest text-center text-lg ${error
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>

                        <div className="text-sm text-gray-500 text-right">
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-blue-600 hover:underline font-medium disabled:opacity-50"
                                >
                                    {resending ? 'Resending...' : 'Resend OTP'}
                                </button>
                            ) : (
                                <span>Resend in <span className="font-medium text-gray-700">{countdown}s</span></span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-400"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-blue-200 flex justify-center items-center h-screen">
                <img
                    src={process.env.NEXT_PUBLIC_LOGO_RIGHT}
                    className="max-h-full max-w-full object-contain"
                    alt="Illustration"
                />
            </div>
        </div>
    );
}
