import React, { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

interface AdBannerProps {
    slot?: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    layoutKey?: string;
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
    showPlaceholderWhenEmpty?: boolean;
}

declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

export default function AdBanner({
    slot = '1234567890',
    format = 'auto',
    layoutKey,
    responsive = true,
    className = '',
    style = {},
    showPlaceholderWhenEmpty = true
}: AdBannerProps) {
    const { settings } = usePage<{ settings?: Record<string, any> }>().props;
    const adsenseClientId = settings?.adsense_client_id;
    const isAdSenseActive = Boolean(adsenseClientId && adsenseClientId.startsWith('ca-pub-'));
    const adRef = useRef<HTMLModElement | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (isAdSenseActive && adRef.current && !initialized.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                initialized.current = true;
            } catch (err) {
                console.debug('AdSense push error or adblock detected:', err);
            }
        }
    }, [isAdSenseActive]);

    // If Google AdSense is not active yet, do not render any placeholder so the site is clean
    if (!isAdSenseActive) {
        return null;
    }

    return (
        <div className={`ad-container my-6 w-full flex flex-col items-center justify-center overflow-hidden ${className}`}>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5 select-none">
                ADVERTISEMENT
            </span>

            <div className="w-full flex justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl overflow-hidden min-h-[90px] p-1 border border-slate-200/60 dark:border-slate-800/60">
                <ins
                    ref={adRef}
                    className="adsbygoogle block w-full text-center"
                    style={{ display: 'block', minWidth: '250px', ...style }}
                    data-ad-client={adsenseClientId}
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive={responsive ? 'true' : 'false'}
                    data-ad-layout-key={layoutKey}
                />
            </div>
        </div>
    );
}
