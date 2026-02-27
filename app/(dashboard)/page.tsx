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
                        <div key={item.id} className="card flex-col justify-between" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div>
                                <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <span className="badge" style={{ backgroundColor: item.status === 'AVAILABLE' ? 'var(--secondary)' : 'var(--danger)' }}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted mb-4">{item.description}</p>

                                <div className="text-xs mb-2">
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

                            <div className="mt-4 pt-4 border-t border-surface-border flex gap-2" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn btn-secondary text-xs"
                                    style={{ flex: 1, padding: '0.25rem 0.5rem' }}
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
