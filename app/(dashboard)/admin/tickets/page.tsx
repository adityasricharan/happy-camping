'use client';
import { useState, useEffect } from 'react';

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('OPEN');
    const [resolutions, setResolutions] = useState<Record<string, string>>({});

    const fetchTickets = async () => {
        setLoading(true);
        const res = await fetch(`/api/tickets?status=${filterStatus === 'ALL' ? '' : filterStatus}`);
        if (res.ok) {
            setTickets(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, [filterStatus]);

    const handleUpdateStatus = async (id: string, status: string) => {
        const res = await fetch(`/api/tickets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, resolutionNotes: status === 'RESOLVED' ? (resolutions[id] || 'Resolved by Administrator') : undefined })
        });
        if (res.ok) {
            fetchTickets();
        } else {
            alert('Failed to update ticket status');
        }
    };

    const getPriorityColor = (priority: string) => {
        if (priority === 'HIGH' || priority === 'CRITICAL') return 'text-danger font-bold';
        if (priority === 'MEDIUM') return 'text-primary font-bold';
        return 'text-muted';
    };

    const getTagLabel = (tag: string) => {
        switch (tag) {
            case 'GEAR_DISPUTE': return '🛡️ Gear Dispute';
            case 'PASSWORD_RESET': return '🔑 Password Reset';
            case 'HELP_REQUEST': return '❓ General Help';
            default: return '📎 Other';
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Service Desk Tickets</h1>

            <div className="flex gap-4 mb-6">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ALL'].map(status => (
                    <button
                        key={status}
                        className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-secondary'} text-sm`}
                        onClick={() => setFilterStatus(status)}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-muted text-center p-12">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="card glass text-center p-12 text-muted mt-4">No {filterStatus.toLowerCase()} tickets found.</div>
            ) : (
                <div className="grid gap-6">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="card p-6 border-l-4" style={{ borderColor: ticket.priority === 'HIGH' ? 'var(--danger)' : 'var(--primary)' }}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs bg-surface-border px-2 py-1 rounded font-bold">
                                            TCK-{ticket.id.split('-')[0].toUpperCase()}
                                        </span>
                                        <span className={`text-xs ${getPriorityColor(ticket.priority)} uppercase tracking-wider`}>
                                            {ticket.priority} PRIORITY
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold">{ticket.title}</h3>
                                    <p className="text-sm text-muted">
                                        Requester: <span className="font-semibold">{ticket.requester?.username || 'Unknown'}</span> |
                                        Category: {getTagLabel(ticket.tag)} |
                                        Date: {new Date(ticket.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="badge bg-surface-border text-foreground tracking-widest uppercase">{ticket.status.replace('_', ' ')}</div>
                            </div>

                            <div className="bg-surface-hover p-4 rounded text-sm mb-4 leading-relaxed border border-surface-border">
                                {ticket.description}
                                {ticket.relatedEntityId && ticket.tag === 'GEAR_DISPUTE' && (
                                    <div className="mt-2 text-xs text-primary font-mono bg-background p-2 rounded">
                                        Linked Request: REQ-{ticket.relatedEntityId.split('-')[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {ticket.resolutionNotes && (
                                <div className="mb-4 text-sm p-4 bg-background border border-primary/20 rounded">
                                    <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-4">
                                {ticket.status === 'OPEN' && (
                                    <button className="btn btn-secondary text-sm" onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}>Mark In Progress</button>
                                )}
                                {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                    <div className="flex-1 flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                        <input
                                            type="text"
                                            placeholder="Resolution details (optional)..."
                                            className="input text-sm flex-1"
                                            value={resolutions[ticket.id] || ''}
                                            onChange={(e) => setResolutions({ ...resolutions, [ticket.id]: e.target.value })}
                                        />
                                        <button className="btn btn-primary text-sm whitespace-nowrap" onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}>Resolve Ticket</button>
                                    </div>
                                )}
                                {ticket.status === 'RESOLVED' && (
                                    <button className="btn btn-danger text-sm" onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}>Close Ticket</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
