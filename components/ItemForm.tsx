'use client';
import { useState, useEffect } from 'react';

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

export default function ItemForm({ item, onClose, onRefresh }: { item?: any, onClose: () => void, onRefresh: () => void }) {
    const [user, setUser] = useState<any>(null);

    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    const [initialCondition, setInitialCondition] = useState(item?.initialCondition || 'Good');
    const [images, setImages] = useState<string[]>(item?.images ? JSON.parse(item.images) : []);
    const [isPublic, setIsPublic] = useState(item?.isPublic ?? true);
    const [personalNotes, setPersonalNotes] = useState(item?.personalNotes || '');
    const [tags, setTags] = useState<string[]>(item?.tags ? JSON.parse(item.tags) : []);
    const [newTag, setNewTag] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [loanObservation, setLoanObservation] = useState('');

    useEffect(() => {
        fetch('/api/me').then(res => res.json()).then(data => setUser(data));
    }, []);

    const isOwner = user?.userId === item?.ownerId;
    const isNew = !item;
    const canEdit = isNew || isOwner || user?.role === 'ADMIN';

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const scaledDataUrl = await resizeImage(file);
            setImages([...images, scaledDataUrl]);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        setLoading(true);
        const payload = { name, description, initialCondition, images, isPublic, personalNotes, tags };
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? '/api/items' : `/api/items/${item.id}`;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            onRefresh();
            onClose();
        } else {
            const data = await res.json();
            setError(data.error);
            setLoading(false);
        }
    };

    const handleRequestLoan = async () => {
        setLoading(true);
        const res = await fetch('/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: item.id,
                loaneeId: user.userId,
                loaneeObservation: loanObservation
            }),
        });

        if (res.ok) {
            onRefresh();
            onClose();
        } else {
            const data = await res.json();
            setError(data.error);
            setLoading(false);
        }
    };

    if (!user) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="card glass">Loading...</div></div>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div className="card glass max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="text-2xl font-bold">{isNew ? 'Log New Gear' : (canEdit ? 'Edit Gear' : 'View Gear')}</h2>
                    <button onClick={onClose} className="text-xl font-bold text-muted hover:text-foreground">&times;</button>
                </div>

                {error && <div className="p-3 mb-4 bg-red-100 text-danger rounded">{error}</div>}

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Name</label>
                            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required disabled={!canEdit} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Initial Condition</label>
                            <input type="text" className="input-field" value={initialCondition} onChange={e => setInitialCondition(e.target.value)} required disabled={!canEdit} placeholder="e.g. New, Slightly Used" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Description</label>
                        <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} required disabled={!canEdit} rows={3} />
                    </div>

                    {(images.length > 0 || canEdit) && (
                        <div className="input-group">
                            <label className="input-label">Images {canEdit && '(Client Resized to avoid storage overhead)'}</label>
                            {canEdit && (
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm mt-1 mb-2 block" />
                            )}
                            {images.length > 0 && (
                                <div className="flex gap-2 mt-2 flex-wrap" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {images.map((src, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <img src={src} alt="Item photo" className="h-20 w-20 object-cover rounded shadow-sm" style={{ height: '5rem', width: '5rem', objectFit: 'cover', borderRadius: '0.25rem' }} />
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                                                    className="absolute -top-2 -right-2 bg-danger text-white rounded-full flex items-center justify-center text-xs"
                                                    style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '9999px', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: 'none', cursor: 'pointer', zIndex: 10, padding: 0 }}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(tags.length > 0 || canEdit) && (
                        <div className="input-group">
                            <label className="input-label">{canEdit ? 'Custom Tags' : 'Tags'}</label>
                            {canEdit && (
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className="input-field flex-1" style={{ flex: 1 }} value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add a tag..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                    <button type="button" className="btn btn-secondary" onClick={addTag}>Add</button>
                                </div>
                            )}
                            {tags.length > 0 && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {tags.map(tag => (
                                        <span key={tag} className="badge bg-primary flex items-center gap-1" onClick={() => canEdit && setTags(tags.filter(t => t !== tag))} style={{ cursor: canEdit ? 'pointer' : 'default' }}>
                                            {tag} {canEdit && <>&times;</>}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {canEdit && (
                        <>
                            <div className="input-group">
                                <label className="input-label">Personal Notes (Only visible to you)</label>
                                <textarea className="input-field" value={personalNotes} onChange={e => setPersonalNotes(e.target.value)} rows={2} />
                            </div>

                            <div className="flex items-center gap-2 mt-2 mb-4">
                                <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4" />
                                <label htmlFor="isPublic" className="input-label mb-0" style={{ marginBottom: 0 }}>List publicly</label>
                            </div>
                        </>
                    )}

                    {!canEdit && item?.status === 'AVAILABLE' && (
                        <div className="p-4 border border-surface-border mt-4 rounded-lg bg-surface-hover" style={{ padding: '1rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-hover)' }}>
                            <h3 className="font-bold text-lg mb-2">Request to Loan</h3>
                            <div className="input-group">
                                <label className="input-label">Your Initial Observation Notes (Optional)</label>
                                <textarea className="input-field" value={loanObservation} onChange={e => setLoanObservation(e.target.value)} rows={2} placeholder="Any notes on condition before you borrow it?" />
                            </div>
                            <button type="button" className="btn btn-primary w-full mt-2" onClick={handleRequestLoan} disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Processing...' : 'Submit Loan Request'}
                            </button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-surface-border">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Close</button>
                        {canEdit && (
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Gear'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
