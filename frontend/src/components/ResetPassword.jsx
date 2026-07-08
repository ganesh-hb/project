'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ResetPassword() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({ password: '', confirmPass: '' });
    const [errors, setErrors] = useState({ password: '', confirmPass: '' });

    useEffect(() => {
        const savedToken = sessionStorage.getItem('resetToken');
        if (!savedToken) {
            router.push('/forgot-password');
            return;
        }
        setToken(savedToken);
    }, [router]);

    const validate = () => {
        const newErrors = { password: '', confirmPass: '' };
        let valid = true;

        if (!formData.password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            valid = false;
        }
        if (!formData.confirmPass) {
            newErrors.confirmPass = 'Please confirm your password';
            valid = false;
        } else if (formData.password !== formData.confirmPass) {
            newErrors.confirmPass = 'Passwords does not match';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/relayapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    endpoint: 'user-resetpass',
                    module: 'user'
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                    confirmPass: formData.confirmPass,
                }),
            });

            const data = await response.json();

            if (data.success === 1) {
                toast.success('Password reset successfully!', { position: 'top-right' });
                sessionStorage.removeItem('resetEmail');
                sessionStorage.removeItem('resetToken');
                router.push('/login');
            } else {
                toast.error(data.message || 'Something went wrong', { position: 'top-right' });
            }
        } catch {
            toast.error('Server error. Please try again.', { position: 'top-right' });
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
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Reset Password
                    </h1>
                    <p className="text-gray-500 mb-10">
                        Choose a new strong password for your account.
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="relative">
                            <label className="block text-sm text-gray-600 mb-2">
                                New Password <span className="text-red-500 text-[16px]">*</span>
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className={`text-black w-full border rounded-lg px-4 py-3 pr-20 outline-none focus:ring-2 ${errors.password
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-11 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showPassword ? 'Hide' : 'View'}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm text-gray-600 mb-2">
                                Confirm Password <span className="text-red-500 text-[16px]">*</span>
                            </label>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPass"
                                value={formData.confirmPass}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className={`text-black w-full border rounded-lg px-4 py-3 pr-20 outline-none focus:ring-2 ${errors.confirmPass
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-11 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showConfirm ? 'Hide' : 'View'}
                            </button>
                            {errors.confirmPass && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPass}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-400 mt-2"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
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
