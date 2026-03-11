'use client';

import { useEffect, useState } from 'react';

const SKETCHES = [
    '/images/delicate_arch_sketch_1773254745567.png',
    '/images/el_capitan_sketch_1773254733004.png',
    '/images/glacier_park_sketch_1773254905246.png',
    '/images/grand_canyon_sketch_1773254761215.png',
    '/images/half_dome_sketch_1773254473721.png',
    '/images/monument_valley_sketch_1773254792065.png',
    '/images/mt_rainier_sketch_1773254774272.png',
    '/images/yellowstone_geyser_sketch_1773254917376.png',
    '/images/zion_canyon_sketch_1773254890469.png'
];

const POLAROIDS = [
    '/images/aspen_grove_polaroid_1773254865232.png',
    '/images/bristlecone_pine_polaroid_1773254834364.png',
    '/images/california_poppy_polaroid_1773254848580.png',
    '/images/joshua_tree_polaroid_1773254805552.png',
    '/images/redwood_polaroid_1773254488391.png',
    '/images/saguaro_cactus_polaroid_1773254818936.png'
];

export function PolaroidAsset() {
    const [assets, setAssets] = useState<{ img: string, rot: number }[]>([]);

    useEffect(() => {
        // Run once per session on mount, avoid per-page randomization
        const shuffled = [...POLAROIDS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(img => ({
            img,
            rot: Math.floor(Math.random() * 8) - 4 // -4 to 4 degrees
        }));
        setAssets(selected);
    }, []);

    if (assets.length === 0) return null;

    return (
        <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', opacity: 0.9 }}>
            {assets.map((asset, i) => (
                <img
                    key={i}
                    src={asset.img}
                    alt="Flora Polaroid"
                    style={{
                        maxWidth: '140px',
                        width: '100%',
                        height: 'auto',
                        mixBlendMode: 'multiply',
                        borderRadius: '2px',
                        boxShadow: '0 4px 6px -1px rgb(43 45 40 / 0.15), 0 2px 4px -2px rgb(43 45 40 / 0.1)',
                        transform: `rotate(${asset.rot}deg)`,
                        transition: 'transform 0.5s'
                    }}
                />
            ))}
        </div>
    );
}

export function SketchAsset() {
    const [sketch, setSketch] = useState('');

    useEffect(() => {
        // Run once per session on mount, avoid per-page randomization
        const randomImage = SKETCHES[Math.floor(Math.random() * SKETCHES.length)];
        setSketch(randomImage);
    }, []);

    if (!sketch) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                height: '350px', // Restrict to header region
                pointerEvents: 'none',
                opacity: 0.8, // Increased opacity to make the faint sketch darker/clearer
                mixBlendMode: 'multiply',
                zIndex: 0,
                backgroundImage: `url('${sketch}')`,
                // Using auto keeps it sharp at native resolution, contain makes it fit the height
                backgroundSize: 'contain',
                backgroundPosition: 'top right',
                backgroundRepeat: 'no-repeat',
            }}
        />
    );
}
