'use client';
import { useState, useEffect } from 'react';

export default function LoansPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const fetchLoans = async () => {
        setLoading(true);
        const res = await fetch('/api/loans');
        if (res.ok) setLoans(await res.json());
        setLoading(false);
    };

    useEffect(() => {
        fetch('/api/me').then(r => r.json()).then(setUser);
        fetchLoans();
    }, []);

    const handleUpdateLoan = async (loanId: string, payload: any) => {
        const res = await fetch(`/api/loans/${loanId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) fetchLoans();
    };

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Active Loans & Requests</h1>

            {loading ? (
                <div className="text-muted">Loading loans...</div>
            ) : loans.length === 0 ? (
                <div className="card glass text-center p-12 text-muted">No active loans found.</div>
            ) : (
                <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {loans.map(loan => {
                        const isOwner = loan.item?.ownerId === user.userId;
                        const isLoanee = loan.loaneeId === user.userId;
                        const isAdmin = user.role === 'ADMIN';

                        return (
                            <div key={loan.id} className="card glass flex flex-col gap-4">
                                <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 className="text-xl font-bold">{loan.item?.name}</h3>
                                        <div className="text-sm text-muted mt-1">
                                            {isOwner ? `Loaned to: ${loan.loanee?.username || loan.externalLoaneeName || 'Unknown'}` : `Owned by someone else`}
                                        </div>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: loan.status === 'ACTIVE' ? 'var(--primary)' : 'var(--secondary)' }}>
                                        {loan.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-surface-border" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <div className="p-4 bg-surface-hover rounded-md" style={{ backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                        <h4 className="font-semibold text-sm mb-2">Loanee Observation</h4>
                                        {isLoanee ? (
                                            <textarea
                                                className="input-field w-full text-sm"
                                                style={{ width: '100%' }}
                                                defaultValue={loan.loaneeObservation}
                                                onBlur={e => handleUpdateLoan(loan.id, { loaneeObservation: e.target.value })}
                                                disabled={loan.status === 'RETURNED'}
                                                placeholder="Add notes about the item's condition..."
                                            />
                                        ) : (
                                            <p className="text-sm">{loan.loaneeObservation || 'No observations recorded.'}</p>
                                        )}
                                    </div>

                                    <div className="p-4 bg-surface-hover rounded-md" style={{ backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                        <h4 className="font-semibold text-sm mb-2">Owner Verification</h4>
                                        {isOwner ? (
                                            <textarea
                                                className="input-field w-full text-sm"
                                                style={{ width: '100%' }}
                                                defaultValue={loan.ownerStatusUpdate}
                                                onBlur={e => handleUpdateLoan(loan.id, { ownerStatusUpdate: e.target.value })}
                                                disabled={loan.status === 'RETURNED'}
                                                placeholder="Verify condition upon return..."
                                            />
                                        ) : (
                                            <p className="text-sm">{loan.ownerStatusUpdate || 'No status updates from owner.'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 justify-end" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    {(isOwner || isLoanee) && loan.status === 'ACTIVE' && !loan.arbitrationRequested && (
                                        <button
                                            className="btn btn-secondary text-sm"
                                            onClick={() => handleUpdateLoan(loan.id, { arbitrationRequested: true })}
                                        >
                                            Request Admin Arbitration
                                        </button>
                                    )}
                                    {loan.arbitrationRequested && (
                                        <span className="badge bg-danger text-white flex items-center" style={{ backgroundColor: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                                            Arbitration Pending
                                        </span>
                                    )}
                                    {isAdmin && loan.arbitrationRequested && loan.status === 'ACTIVE' && (
                                        <button
                                            className="btn btn-secondary text-sm"
                                            style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}
                                            onClick={() => handleUpdateLoan(loan.id, { arbitrationRequested: false })}
                                        >
                                            Resolve Arbitration
                                        </button>
                                    )}
                                    {isOwner && loan.status === 'ACTIVE' && (
                                        <button
                                            className="btn btn-primary text-sm"
                                            onClick={() => handleUpdateLoan(loan.id, { status: 'RETURNED' })}
                                        >
                                            Mark as Returned
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
