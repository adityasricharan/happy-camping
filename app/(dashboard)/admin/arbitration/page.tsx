'use client';
import { useState, useEffect } from 'react';

export default function AdminArbitrationPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolutions, setResolutions] = useState<Record<string, string>>({});

    const fetchDisputes = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/arbitration');
        if (res.ok) {
            setDisputes(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (id: string) => {
        const notes = resolutions[id] || 'Resolved by Administrator';
        const res = await fetch(`/api/admin/arbitration/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolutionNotes: notes })
        });
        if (res.ok) {
            fetchDisputes();
        } else {
            const data = await res.json();
            alert(`Error: ${data.error}`);
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Dispute Arbitration Console</h1>

            {loading ? (
                <div className="text-muted">Loading disputes...</div>
            ) : disputes.length === 0 ? (
                <div className="card glass text-center p-12 text-muted">No active disputes found. The system is clean!</div>
            ) : (
                <div className="grid gap-6">
                    {disputes.map(dispute => (
                        <div key={dispute.id} className="card p-6 border-l-4 border-danger">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs bg-surface-border px-2 py-1 rounded font-bold">
                                            REQ-{dispute.id.split('-')[0].toUpperCase()}
                                        </span>
                                        <h3 className="text-xl font-bold">{dispute.item.name}</h3>
                                    </div>
                                    <p className="text-sm text-muted">Owner: {dispute.item.owner?.username} | Loanee: {dispute.loanee?.username}</p>
                                </div>
                                <span className="badge bg-danger text-white">Action Required</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-hover p-4 rounded mb-4">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Receipt Phase</h4>
                                    <p className="text-xs">User Reported: {dispute.receivedCondition || 'None'}</p>
                                    <p className="text-xs font-bold mt-1">Status: {dispute.receivedConditionStatus}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Return Phase</h4>
                                    <p className="text-xs">Owner Reported: {dispute.returnCondition || 'None'}</p>
                                    <p className="text-xs font-bold mt-1">Status: {dispute.returnConditionStatus}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    className="input text-sm flex-1"
                                    placeholder="Enter administrative resolution notes..."
                                    value={resolutions[dispute.id] || ''}
                                    onChange={e => setResolutions({ ...resolutions, [dispute.id]: e.target.value })}
                                />
                                <button className="btn btn-primary" onClick={() => handleResolve(dispute.id)}>Force Resolve & Unlock Item</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
