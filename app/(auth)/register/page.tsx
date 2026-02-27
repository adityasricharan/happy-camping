'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('user'); // Basic toggle for demo
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, type }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || 'Registration failed');
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="container flex flex-col items-center justify-center min-h-screen animate-fade-in" style={{ justifyContent: 'center', height: '100vh', display: 'flex' }}>
            <div className="card glass max-w-md w-full p-8" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ textAlign: 'center' }}>Create Account</h2>
                {error && <div className="p-4 mb-4 text-sm font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="role">Role Type</label>
                        <select
                            id="role"
                            className="input-field"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="user">Standard User</option>
                            <option value="admin">Administrator (For Demo)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-sm text-muted mt-6" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    {"Already have an account? "}
                    <Link href="/login" className="font-medium" style={{ color: 'var(--primary)' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
