// SVG Icon Library — consistent stroke style

interface IconProps {
    size?: number;
    className?: string;
    strokeWidth?: number;
}

const defaults: Required<Pick<IconProps, 'size' | 'strokeWidth'>> = {
    size: 20,
    strokeWidth: 1.75,
};

function createIcon(paths: string, viewBox = '0 0 24 24') {
    return function Icon({ size = defaults.size, className = '', strokeWidth = defaults.strokeWidth }: IconProps) {
        return (
            <svg
                width={size}
                height={size}
                viewBox={viewBox}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <g dangerouslySetInnerHTML={{ __html: paths }} />
            </svg>
        );
    };
}

// Navigation
export const ArrowLeft = createIcon(
    '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>'
);

export const CloseX = createIcon(
    '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>'
);

// Actions  
export const PlusCircle = createIcon(
    '<circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>'
);

export const Pencil = createIcon(
    '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>'
);

export const Bookmark = createIcon(
    '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>'
);

// Brand & Status
export const StarFilled = ({ size = 14, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export const Compass = createIcon(
    '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none"/>'
);

// Bottom Nav  
export const ActivityPulse = createIcon(
    '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
);

export const MessageBubble = createIcon(
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
);

export const UserCircle = createIcon(
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>'
);

// Feature icons
export const Infinity = createIcon(
    '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>'
);

export const Film = createIcon(
    '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M17 7h4"/><path d="M3 12h18"/><path d="M3 17h4"/><path d="M17 17h4"/>'
);

export const GlobeCrosshair = createIcon(
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
);

export const ShieldCheck = createIcon(
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'
);

// Data indicators
export const MapPin = createIcon(
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
);

export const Clock = createIcon(
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
);

export const DollarSign = createIcon(
    '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
);

export const Sparkles = createIcon(
    '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>'
);

export const ChevronRight = createIcon(
    '<path d="m9 18 6-6-6-6"/>'
);
