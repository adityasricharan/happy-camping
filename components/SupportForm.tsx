'use client';
import { useState } from 'react';

export default function SupportForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tag, setTag] = useState('HELP_REQUEST');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, tag })
            });

            if (res.ok) {
                setSuccess(true);
                setTitle('');
                setDescription('');
                setTag('HELP_REQUEST');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to submit ticket');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card glass p-8">
            <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
            <p className="text-muted text-sm mb-6">Need help or want to request a password reset? Submit a ticket below.</p>

            {success && (
                <div className="p-4 mb-6 bg-surface-border text-primary rounded-lg border border-primary">
                    ✅ Your ticket has been submitted successfully! An administrator will review it shortly.
                </div>
            )}

            {error && (
                <div className="p-4 mb-6 bg-red-100 text-danger rounded-lg border border-danger">
                    ❌ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="input-group">
                    <label className="input-label">I need help with...</label>
                    <select
                        className="input-field bg-white"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        required
                    >
                        <option value="HELP_REQUEST">General Question / Help Request</option>
                        <option value="PASSWORD_RESET">Password Reset Request</option>
                        <option value="OTHER">Other Issues</option>
                    </select>
                </div>

                <div className="input-group">
                    <label className="input-label">Subject</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Brief summary of the issue"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Detailed Description</label>
                    <textarea
                        className="input-field"
                        rows={4}
                        placeholder="Please provide any relevant details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary mt-2"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
            </form>
        </div>
    );
}
