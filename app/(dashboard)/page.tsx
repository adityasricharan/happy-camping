'use client';
import { useState, useEffect } from 'react';
import ItemForm from '@/components/ItemForm';

export default function DashboardPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('personal');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [activeTag, setActiveTag] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('date_desc');
    const [showItemForm, setShowItemForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const fetchItems = async () => {
        setLoading(true);
        let url = `/api/items?filter=${filter}`;
        if (activeTag) url += `&tag=${encodeURIComponent(activeTag)}`;

        const res = await fetch(url);
        if (res.ok) {
            let data = await res.json();

            // Client-side sorting
            if (sortBy === 'name_asc') data.sort((a: any, b: any) => a.name.localeCompare(b.name));
            if (sortBy === 'cond_asc') data.sort((a: any, b: any) => a.initialCondition.localeCompare(b.initialCondition));
            if (sortBy === 'loc_asc') data.sort((a: any, b: any) => (a.location || '').localeCompare(b.location || ''));
            if (sortBy === 'date_desc') data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setItems(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (filter === 'global') setViewMode('grid');
        else setViewMode('list');
        setActiveTag('');
        fetchItems();
    }, [filter]);

    useEffect(() => {
        fetchItems();
    }, [activeTag, sortBy]);

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

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
                <div className="flex gap-4">
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

                <div className="flex gap-2 items-center flex-wrap">
                    <div className="flex bg-surface-hover rounded p-1 border border-surface-border">
                        <button className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-background shadow-sm font-bold' : 'text-muted'}`} onClick={() => setViewMode('list')}>List</button>
                        <button className={`px-3 py-1 text-sm rounded ${viewMode === 'grid' ? 'bg-background shadow-sm font-bold' : 'text-muted'}`} onClick={() => setViewMode('grid')}>Grid</button>
                    </div>

                    <select className="input text-sm py-1 min-w-[120px]" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="date_desc">Newest First</option>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="cond_asc">Condition</option>
                        <option value="loc_asc">Location</option>
                    </select>

                    <div className="relative">
                        <input
                            type="text"
                            className="input text-sm py-1 placeholder-muted"
                            placeholder="Filter by tag..."
                            value={activeTag}
                            onChange={(e) => setActiveTag(e.target.value)}
                        />
                        {activeTag && (
                            <button className="absolute right-2 top-1.5 text-xs text-muted hover:text-foreground" onClick={() => setActiveTag('')}>&times;</button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-12 text-muted">Loading items...</div>
            ) : items.length === 0 ? (
                <div className="card glass text-center p-12 text-muted mt-4">
                    No items found in this view.
                </div>
            ) : viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                    {items.map(item => (
                        <div key={item.id} className="card p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-surface-hover transition-colors">
                            <div className="h-16 w-16 bg-surface-border rounded overflow-hidden shrink-0 flex items-center justify-center">
                                {item.images && JSON.parse(item.images).length > 0 ? (
                                    <img src={JSON.parse(item.images)[0]} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 text-muted"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg truncate">{item.name}</h3>
                                    <span className="badge text-[10px] px-1.5 py-0.5 whitespace-nowrap" style={{ backgroundColor: item.status === 'AVAILABLE' ? 'var(--secondary)' : 'var(--danger)' }}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="text-sm text-muted truncate max-w-2xl">{item.description}</div>

                                {item.tags && JSON.parse(item.tags).length > 0 && (
                                    <div className="flex gap-1 mt-2 overflow-x-auto pb-1 hide-scrollbar">
                                        {JSON.parse(item.tags).map((tag: string) => (
                                            <span key={tag} onClick={() => setActiveTag(tag)} className="cursor-pointer badge bg-surface-border text-foreground text-[10px] hover:bg-primary/20 transition-colors whitespace-nowrap">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 text-xs md:text-right w-full md:w-48 shrink-0 bg-background md:bg-transparent p-2 md:p-0 rounded border border-surface-border md:border-none">
                                <div className="flex-1 md:flex-none"><span className="text-muted block md:inline text-[10px] uppercase">Condition</span><br className="hidden md:block" /> {item.initialCondition}</div>
                                <div className="flex-1 md:flex-none"><span className="text-muted block md:inline text-[10px] uppercase">Location</span><br className="hidden md:block" /> {item.location || 'Unspecified'}</div>
                                {filter === 'global' && item.owner && (
                                    <div className="flex-1 md:flex-none"><span className="text-muted block md:inline text-[10px] uppercase">Owner</span><br className="hidden md:block" /> {item.owner.username}</div>
                                )}
                            </div>

                            <div className="w-full md:w-auto mt-2 md:mt-0">
                                <button className="btn btn-secondary text-sm w-full md:w-auto" onClick={() => { setSelectedItem(item); setShowItemForm(true); }}>
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
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

                                <div className="flex gap-4 text-xs mb-2 mt-auto">
                                    <div><span className="font-semibold text-muted">Condition:</span><br /> {item.initialCondition}</div>
                                    <div><span className="font-semibold text-muted">Location:</span><br /> {item.location || 'Unspecified'}</div>
                                </div>
                                {item.owner && (
                                    <div className="text-xs mb-4">
                                        <span className="font-semibold text-muted">Owner:</span> {item.owner.username}
                                    </div>
                                )}
                                {item.tags && JSON.parse(item.tags).length > 0 && (
                                    <div className="flex gap-2 mt-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {JSON.parse(item.tags).map((tag: string) => (
                                            <span key={tag} onClick={() => setActiveTag(tag)} className="cursor-pointer badge bg-surface-border text-foreground text-xs hover:bg-primary/20" style={{ backgroundColor: 'var(--surface-border)', color: 'var(--foreground)', fontSize: '0.65rem' }}>{tag}</span>
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
