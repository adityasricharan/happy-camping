'use client';
import { useState, useEffect } from 'react';

export default function LoansPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'borrowed' | 'lent'>('borrowed');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    // Form fields for active actions
    const [receivedConditions, setReceivedConditions] = useState<Record<string, string>>({});
    const [returnConditions, setReturnConditions] = useState<Record<string, string>>({});

    const fetchLoans = async () => {
        setLoading(true);
        const res = await fetch('/api/loans');
        if (res.ok) {
            setLoans(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetch('/api/auth/session').then(r => r.json()).then(data => {
            if (data?.user) setCurrentUsername(data.user.username);
        });
        fetchLoans();
    }, []);

    const handleAction = async (id: string, action: string, payload: any = {}) => {
        const res = await fetch(`/api/loans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload })
        });
        if (res.ok) {
            fetchLoans();
        } else {
            const data = await res.json();
            alert(`Error: ${data.error}`);
        }
    };

    const borrowedLoans = loans.filter(l => l.loanee?.username === currentUsername);
    const lentLoans = loans.filter(l => l.item.owner?.username === currentUsername || (!l.loanee && l.externalLoaneeName === null && !borrowedLoans.includes(l)));
    let displayLoans = filter === 'borrowed' ? borrowedLoans : loans.filter(l => !borrowedLoans.includes(l));

    if (searchQuery) {
        displayLoans = displayLoans.filter(l => {
            const shortId = `REQ-${l.id.split('-')[0].toUpperCase()}`;
            return shortId.includes(searchQuery.toUpperCase()) || l.item.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Loan Management</h1>

            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4 items-start md:items-center">
                <div className="flex gap-4" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${filter === 'borrowed' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('borrowed')}
                    >
                        My Borrowed Gear
                    </button>
                    <button
                        className={`btn ${filter === 'lent' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('lent')}
                    >
                        My Gear on Loan
                    </button>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search ID (e.g. REQ-A1B2) or Item..."
                        className="input text-sm p-2 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center p-12 text-muted">Loading transactions...</div>
            ) : displayLoans.length === 0 ? (
                <div className="card glass text-center p-12 text-muted mt-4">
                    No active requests found.
                </div>
            ) : (
                <div className="grid gap-6">
                    {displayLoans.map((loan) => (
                        <div key={loan.id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs bg-surface-border px-2 py-1 rounded font-bold">
                                        REQ-{loan.id.split('-')[0].toUpperCase()}
                                    </span>
                                    <h3 className="text-xl font-bold">{loan.item.name}</h3>
                                </div>
                                <p className="text-sm text-muted mb-2">Requested on: {new Date(loan.createdAt).toLocaleDateString()}</p>

                                <div className="text-sm mt-2">
                                    <span className="font-semibold">Status:</span>
                                    <span className="ml-2 badge bg-surface-border text-foreground">{loan.status}</span>
                                </div>

                                {loan.receivedCondition && (
                                    <div className="text-xs mt-2 p-2 bg-surface-hover rounded">
                                        <strong>Reported Condition on Receipt:</strong> {loan.receivedCondition}
                                        <br /><em>(Owner Review: {loan.receivedConditionStatus})</em>
                                    </div>
                                )}
                                {loan.returnCondition && (
                                    <div className="text-xs mt-2 p-2 bg-surface-hover rounded border border-danger">
                                        <strong>Reported Condition on Return:</strong> {loan.returnCondition}
                                        <br /><em>(Owner Review: {loan.returnConditionStatus})</em>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 min-w-[200px]">
                                {filter === 'lent' ? (
                                    // OWNER ACTIONS
                                    <>
                                        {loan.status === 'PENDING' && (
                                            <>
                                                <button className="btn btn-primary text-sm p-2 w-full" onClick={() => handleAction(loan.id, 'APPROVE')}>Approve Request</button>
                                                <button className="btn btn-danger text-sm p-2 w-full" onClick={() => handleAction(loan.id, 'REJECT')}>Reject Request</button>
                                            </>
                                        )}
                                        {loan.status === 'ACTIVE' && loan.receivedConditionStatus === 'PENDING_OWNER_REVIEW' && (
                                            <div className="border border-surface-border p-2 rounded">
                                                <p className="text-xs mb-2">Review Receipt Condition</p>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-primary text-xs flex-1 text-center justify-center p-1" onClick={() => handleAction(loan.id, 'REVIEW_RECEIVE_CONDITION', { status: 'ACCEPTED' })}>Accept</button>
                                                    <button className="btn btn-danger text-xs flex-1 text-center justify-center p-1" onClick={() => handleAction(loan.id, 'REVIEW_RECEIVE_CONDITION', { status: 'DISPUTED' })}>Dispute</button>
                                                </div>
                                            </div>
                                        )}
                                        {loan.status === 'RETURN_PENDING' && (
                                            <div className="border border-surface-border p-2 rounded flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Confirm condition..."
                                                    className="input text-sm p-2"
                                                    value={returnConditions[loan.id] || ''}
                                                    onChange={(e) => setReturnConditions({ ...returnConditions, [loan.id]: e.target.value })}
                                                />
                                                <div className="flex gap-2">
                                                    <button className="btn btn-primary text-xs flex-1 text-center justify-center p-1" onClick={() => handleAction(loan.id, 'CONFIRM_RETURN', { status: 'ACCEPTED', returnCondition: returnConditions[loan.id] })}>Accept Return</button>
                                                    <button className="btn btn-danger text-xs flex-1 text-center justify-center p-1" onClick={() => handleAction(loan.id, 'CONFIRM_RETURN', { status: 'DISPUTED', returnCondition: returnConditions[loan.id] })}>Dispute Return</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // LOANEE ACTIONS
                                    <>
                                        {loan.status === 'APPROVED' && (
                                            <div className="border border-surface-border p-2 rounded flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Condition upon receipt..."
                                                    className="input text-sm p-2"
                                                    value={receivedConditions[loan.id] || ''}
                                                    onChange={(e) => setReceivedConditions({ ...receivedConditions, [loan.id]: e.target.value })}
                                                />
                                                <button className="btn btn-primary text-sm p-2 w-full text-center" onClick={() => handleAction(loan.id, 'RECEIVE', { receivedCondition: receivedConditions[loan.id] })}>Mark as Received</button>
                                            </div>
                                        )}
                                        {loan.status === 'ACTIVE' && (
                                            <button className="btn btn-primary text-sm p-2 w-full text-center" onClick={() => handleAction(loan.id, 'MARK_RETURNED')}>Return Gear</button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
