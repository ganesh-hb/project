'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Enter a valid email');
            return;
        }

        setLoading(true);
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
                toast.success('OTP sent to your email!', { position: 'top-right' });
                sessionStorage.setItem('resetEmail', email);
                router.push('/confirm-otp');
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
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
                        onClick={() => router.push('/login')}
                        className="flex items-center gap-2 text-gray-500 text-sm mb-8 hover:text-blue-600 transition"
                    >
                        ← Back to Login
                    </button>

                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-500 mb-10">
                        Enter your registered email address. We'll send an OTP to reset your password.
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">
                                Email Address <span className="text-red-500 text-[16px]">*</span>
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                placeholder="Enter your email"
                                className={`text-black w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 ${error
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-400 mt-2"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
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
