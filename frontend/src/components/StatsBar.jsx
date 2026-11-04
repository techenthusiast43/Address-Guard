import React from 'react';
import { BookMarked, User, Users, Landmark, Rocket, Folder } from 'lucide-react';

export default function StatsBar({ addresses = [], onSelectCategory, activeCategory }) {
  const total = addresses.length;
  
  const counts = addresses.reduce(
    (acc, curr) => {
      const cat = curr.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    { Personal: 0, Friends: 0, Exchanges: 0, Projects: 0 }
  );

  const stats = [
    {
      id: 'All',
      name: 'Total Saved',
      count: total,
      icon: BookMarked,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
    },
    {
      id: 'Personal',
      name: 'Personal',
      count: counts.Personal || 0,
      icon: User,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      id: 'Friends',
      name: 'Friends',
      count: counts.Friends || 0,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      id: 'Exchanges',
      name: 'Exchanges',
      count: counts.Exchanges || 0,
      icon: Landmark,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      id: 'Projects',
      name: 'Projects',
      count: counts.Projects || 0,
      icon: Rocket,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeCategory === stat.id;

        return (
          <button
            key={stat.id}
            onClick={() => onSelectCategory(stat.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              isActive
                ? `${stat.bg} ${stat.border} ring-1 ring-teal-500/40 shadow-lg`
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{stat.name}</span>
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">{stat.count}</div>
          </button>
        );
      })}
    </div>
  );
}

