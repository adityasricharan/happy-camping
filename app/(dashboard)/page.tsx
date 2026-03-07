'use client';
import { useState, useEffect } from 'react';
import ItemForm from '@/components/ItemForm';

export default function DashboardPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('personal');
    const [showItemForm, setShowItemForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const fetchItems = async () => {
        setLoading(true);
        const res = await fetch(`/api/items?filter=${filter}`);
        if (res.ok) {
            setItems(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [filter]);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => { setSelectedItem(null); setShowItemForm(true); }}
                >
                    + Add New Gear
                </button>
            </div>

            <div className="flex gap-4 mb-6" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    className={`btn ${filter === 'personal' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('personal')}
                >
                    My Gear
                </button>
                <button
                    className={`btn ${filter === 'global' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('global')}
                >
                    Global Rental List
                </button>
            </div>

            {loading ? (
                <div className="text-center p-12 text-muted">Loading items...</div>
            ) : items.length === 0 ? (
                <div className="card glass text-center p-12 text-muted mt-4">
                    No items found in this view.
                </div>
            ) : (
                <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {items.map(item => (
                        <div key={item.id} className="card flex-col justify-between p-0 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--surface-border)' }}>
                                {item.images && JSON.parse(item.images).length > 0 ? (
                                    <img src={JSON.parse(item.images)[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span className="text-muted text-sm font-semibold flex flex-col items-center gap-2">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        No Image Found
                                    </span>
                                )}
                            </div>
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <span className="badge" style={{ backgroundColor: item.status === 'AVAILABLE' ? 'var(--secondary)' : 'var(--danger)' }}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted mb-4 flex-1">{item.description}</p>

                                <div className="text-xs mb-2 mt-auto">
                                    <span className="font-semibold">Condition:</span> {item.initialCondition}
                                </div>
                                {item.owner && (
                                    <div className="text-xs mb-4">
                                        <span className="font-semibold">Owner:</span> {item.owner.username}
                                    </div>
                                )}
                                {item.tags && JSON.parse(item.tags).length > 0 && (
                                    <div className="flex gap-2 mt-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {JSON.parse(item.tags).map((tag: string) => (
                                            <span key={tag} className="badge bg-surface-border text-foreground text-xs" style={{ backgroundColor: 'var(--surface-border)', color: 'var(--foreground)', fontSize: '0.65rem' }}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 pt-0 mt-auto border-t border-surface-border flex gap-2" style={{ padding: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn btn-secondary text-xs"
                                    style={{ flex: 1, padding: '0.5rem 0.5rem' }}
                                    onClick={() => { setSelectedItem(item); setShowItemForm(true); }}
                                >
                                    View / Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showItemForm && (
                <ItemForm
                    item={selectedItem}
                    onClose={() => setShowItemForm(false)}
                    onRefresh={fetchItems}
                />
            )}
        </div>
    );
}
