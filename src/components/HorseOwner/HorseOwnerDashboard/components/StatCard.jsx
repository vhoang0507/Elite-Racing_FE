import {
    FaClipboardList,
    FaEnvelope,
    FaHorseHead,
    FaTrophy,
} from "react-icons/fa";

const toneClass = {
    blue: 'bg-[#e3f2fd] text-[#1565c0]',
    gold: 'bg-[#fff3cd] text-[#856404]',
    green: 'bg-[#dff7e9] text-[#118548]',
    primary: 'bg-[#ffe8e4] text-[var(--admin-primary)]',
};

const iconByLabel = {
    'Approved Races': FaTrophy,
    'Pending Invitations': FaEnvelope,
    Registrations: FaClipboardList,
    'Total Horse': FaHorseHead,
};

const toneByLabel = {
    'Approved Races': 'green',
    'Pending Invitations': 'gold',
    Registrations: 'blue',
    'Total Horse': 'primary',
};

export default function StatCard({ icon, label, value, tone }) {
    const Icon = typeof icon === 'function' ? icon : iconByLabel[label] || FaHorseHead;
    const visualTone = tone || toneByLabel[label] || 'primary';

    return (
        <div className="stat-card">
            <div className={`stat-icon ${toneClass[visualTone] || toneClass.primary}`}>
                <Icon aria-hidden="true" />
            </div>
            <p className="stat-label m-0">{label}</p>
            <h2 className="stat-value">{value}</h2>
        </div>
    );
}
