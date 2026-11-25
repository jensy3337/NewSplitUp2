import React from 'react';
import { Plus, Sun, Moon, Monitor } from 'lucide-react';
import { Team, UserProfile } from '../types';
import { getInitials } from '../utils/storage';
import { Avatar } from './Avatar';

interface TeamRailProps {
  teams: Team[];
  activeTeamIndex: number;
  profile: UserProfile;
  resolvedTheme: 'dark' | 'light';
  onSelectTeam: (index: number) => void;
  onOpenCreateJoin: () => void;
  onOpenProfile: () => void;
  onCycleTheme: () => void;
}

export const TeamRail: React.FC<TeamRailProps> = ({
  teams,
  activeTeamIndex,
  profile,
  resolvedTheme,
  onSelectTeam,
  onOpenCreateJoin,
  onOpenProfile,
  onCycleTheme,
}) => {
  const ThemeIcon =
    profile.themeMode === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <nav
      aria-label="Project rooms"
      className="hidden md:flex flex-col items-center w-[72px] shrink-0 bg-[var(--rail-bg)] py-3 gap-2 border-r border-[var(--border-subtle)] select-none"
    >
      {/* Brand Mark */}
      <div
        className="w-12 h-12 rounded-[16px] flex items-center justify-center font-display font-extrabold text-sm tracking-tight text-white mb-1 shadow-sm"
        style={{ backgroundColor: 'var(--accent)' }}
        title="SplitUp Student Workspace"
      >
        SU
      </div>

      <div className="w-8 h-[1px] bg-[var(--border-subtle)] my-0.5" />

      {/* Team Icons */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto py-1">
        {teams.map((team, idx) => {
          const isActive = idx === activeTeamIndex;
          return (
            <div key={team.id} className="relative w-full flex items-center justify-center group">
              {/* Left active indicator bar */}
              <span
                aria-hidden="true"
                className={`absolute left-0 w-1 rounded-r-full bg-[var(--text-heading)] transition-all duration-150 ${
                  isActive
                    ? 'h-9 opacity-100'
                    : 'h-4 opacity-0 group-hover:opacity-60'
                }`}
              />
              <button
                type="button"
                onClick={() => onSelectTeam(idx)}
                aria-label={`Open room ${team.name}`}
                aria-current={isActive ? 'page' : undefined}
                title={`${team.name} (${team.code})`}
                className={`w-12 h-12 flex items-center justify-center font-display font-bold text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'rounded-[14px] text-white'
                    : 'rounded-[24px] hover:rounded-[14px] bg-[var(--card-bg)] text-[var(--text-primary)] hover:text-white hover:bg-[var(--accent)]'
                }`}
                style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {getInitials(team.name)}
              </button>
            </div>
          );
        })}

        {/* Create or Join Team button */}
        <button
          type="button"
          onClick={onOpenCreateJoin}
          aria-label="Create or join a project room"
          title="Create or join a room"
          className="w-12 h-12 rounded-[24px] hover:rounded-[14px] bg-[var(--card-bg)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white flex items-center justify-center transition-all duration-150 cursor-pointer mt-1"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Theme & Profile Quick Actions */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-[var(--border-subtle)] w-full">
        <button
          type="button"
          onClick={onCycleTheme}
          aria-label={`Theme mode: ${profile.themeMode}. Click to switch theme`}
          title={`Theme: ${profile.themeMode} (click to cycle)`}
          className="w-10 h-10 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Customize your student profile"
          title={`${profile.name} — Customize Profile`}
          className="rounded-full p-0.5 hover:ring-2 hover:ring-[var(--accent)] transition-all cursor-pointer"
        >
          <Avatar
            name={profile.name}
            color={profile.avatarColor}
            avatarUrl={profile.avatarUrl}
            status={profile.status}
            size="md"
            showStatusDot
          />
        </button>
      </div>
    </nav>
  );
};
