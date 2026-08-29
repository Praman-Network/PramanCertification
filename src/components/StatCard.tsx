import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'default';
}

export default function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-label">
        {Icon && <Icon size={13} style={{ opacity: 0.8 }} />}
        <span>{label}</span>
      </div>
      <div className={`stat-value ${variant}`}>
        {value}
      </div>
    </div>
  );
}
