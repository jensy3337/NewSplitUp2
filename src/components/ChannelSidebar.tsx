import React, { useState } from 'react';
import {
  Hash,
  MessageSquare,
  Kanban,
  BarChart3,
  CalendarClock,
  Star,
  Copy,
  Check,
  Settings,
  Shield,
  Crown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ChannelId, Member, Team, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { roleLabel, statusLabel } from '../utils/storage';

export const CHANNELS: { id: ChannelId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'team-chat', label: 'team-chat', icon: MessageSquare },
  { id: 'task-board', label: 'task-board', icon: Kanban },
  { id: 'contributions', label: 'contributions', icon: BarChart3 },
  { id: 'deadlines', label: 'deadlines', icon: CalendarClock },
  { id: 'peer-feedback', label: 'peer-feedback', icon: Star },
];

interface ChannelSidebarProps {
  team: Team | undefined;
  currentUserMember: Member | undefined;
  activeChannel: ChannelId;
  profile: UserProfile;
  mobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
  onSelectChannel: (channel: ChannelId) => void;
  onSelectMember: (member: Member) => void;
  onOpenRoomSettings: () => void;
  onOpenProfile: () => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  team,
  currentUserMember,
  activeChannel,
  profile,
  mobileDrawerOpen,
  onCloseMobileDrawer,
  onSelectChannel,
  onSelectMember,
  onOpenRoomSettings,
  onOpenProfile,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    }
  };

  const openTasksCount = team ? team.tasks.filter((t) => t.status !== 2).length : 0;

  const sortedMembers = team
    ? [...team.members].sort((a, b) => {
        const order = { leader: 0, moderator: 1, member: 2 };
        if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
        return a.name.localeCompare(b.name);
      })
    : [];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] text-[var(--text-primary)]">
      {/* Team Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
        <div className="min-w-0 pr-2">
          <div className="font-display font-bold text-[15px] text-[var(--text-heading)] truncate">
            {team ? team.name : 'No Room Selected'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] truncate flex items-center gap-1.5">
            <span>SplitUp</span>
            {currentUserMember && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {roleLabel(currentUserMember.role)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {team && (
            <button
              type="button"
              onClick={() => {
                onCloseMobileDrawer();
                onOpenRoomSettings();
              }}
              aria-label="Room settings, roles, and leave or delete options"
              title="Room Settings & Roles"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            aria-label="Close room sidebar"
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card-hover)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Channels List */}
      {team ? (
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-[var(--text-muted)]">
              Project Channels
            </div>
            <ul className="space-y-0.5">
              {CHANNELS.map((ch) => {
                const active = activeChannel === ch.id;
                return (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChannel(ch.id);
                        onCloseMobileDrawer();
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--card-hover)] text-[var(--text-heading)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Hash className="w-4 h-4 shrink-0 opacity-75" />
                        <span className="truncate">{ch.label}</span>
                      </span>
                      {ch.id === 'task-board' && openTasksCount > 0 && (
                        <span className="text-[11px] font-mono-tabular text-[var(--text-muted)] shrink-0">
                          {openTasksCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Member List */}
          <div>
            <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wider text-[var(--text-muted)]">
              <span>Members ({sortedMembers.length})</span>
              {(currentUserMember?.role === 'leader' ||
                currentUserMember?.role === 'moderator') && (
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobileDrawer();
                    onOpenRoomSettings();
                  }}
                  className="text-[11px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Manage
                </button>
              )}
            </div>
            <ul className="space-y-0.5">
              {sortedMembers.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onCloseMobileDrawer();
                      onSelectMember(member);
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--card-bg)] transition-colors text-left cursor-pointer group"
                    aria-label={`View profile for ${member.name} (${roleLabel(member.role)})`}
                  >
                    <Avatar
                      name={member.name}
                      color={member.color}
                      avatarUrl={member.avatarUrl}
                      status={member.status}
                      size="sm"
                      showStatusDot
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--text-heading)] truncate">
                          {member.name}
                        </span>
                        {member.isCurrentUser && (
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] truncate">
                        {member.role === 'leader' && (
                          <Crown className="w-3 h-3 text-[var(--warning)] shrink-0" />
                        )}
                        {member.role === 'moderator' && (
                          <Shield className="w-3 h-3 text-[var(--accent)] shrink-0" />
                        )}
                        <span>{roleLabel(member.role)}</span>
                        {member.major && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{member.major}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 text-sm text-[var(--text-muted)]">
          Create or join a project room from the left rail to start collaborating.
        </div>
      )}

      {/* Invite Code Box */}
      {team && (
        <div className="px-3 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)]">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)]">
                Invite Code
              </div>
              <div className="font-mono-tabular text-xs font-semibold text-[var(--text-heading)] truncate">
                {team.code}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy room invite code"
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Profile Dock (Always accessible to everyone) */}
      <div className="px-2.5 py-2 border-t border-[var(--border-subtle)] bg-[var(--rail-bg)] flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onCloseMobileDrawer();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-lg hover:bg-[var(--card-bg)] transition-colors text-left cursor-pointer"
          aria-label="Edit your profile"
        >
          <Avatar
            name={profile.name}
            color={profile.avatarColor}
            avatarUrl={profile.avatarUrl}
            status={profile.status}
            size="sm"
            showStatusDot
          />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--text-heading)] truncate">
              {profile.name}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] truncate">
              {statusLabel(profile.status)}
              {profile.major ? ` · ${profile.major}` : ''}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onCloseMobileDrawer();
            onOpenProfile();
          }}
          aria-label="Customize profile and theme preferences"
          title="Customize Profile & Theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card-bg)] transition-colors shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed 248px Sidebar */}
      <aside className="hidden md:flex flex-col w-[248px] shrink-0 border-r border-[var(--border-subtle)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobileDrawer}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
