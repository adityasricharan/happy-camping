'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Updating password...' });

        try {
            const res = await fetch('/api/me/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus({ type: 'error', message: data.error || 'Failed to update password' });
                return;
            }

            setStatus({ type: 'success', message: 'Password updated successfully! You can now use your new password next time you sign in.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">⚙️ Account Settings</h1>

            <div className="card glass">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>

                {status.type !== 'idle' && (
                    <div className={`p-4 mb-6 rounded-md text-sm border ${status.type === 'error' ? 'bg-danger/10 border-danger text-danger' :
                            status.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' :
                                'bg-surface-border text-muted'
                        }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            required
                            className="input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            required
                            minLength={6}
                            className="input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            required
                            minLength={6}
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.type === 'loading'}
                        className="btn btn-primary mt-4 self-start"
                    >
                        {status.type === 'loading' ? 'Saving...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
