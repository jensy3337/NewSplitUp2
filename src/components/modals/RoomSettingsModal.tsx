import React, { useState } from 'react';
import {
  X,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  LogOut,
  Trash2,
  RefreshCw,
  Lock,
  Check,
  Copy,
} from 'lucide-react';
import { Member, MemberRole, Team } from '../../types';
import { roleLabel } from '../../utils/storage';
import { Avatar } from '../Avatar';

interface RoomSettingsModalProps {
  team: Team;
  currentUserMember: Member;
  onUpdateRoomDetails: (name: string, course: string) => void;
  onRegenerateCode: () => void;
  onAddTeammate: (name: string, role: MemberRole) => void;
  onChangeRole: (memberId: string, newRole: MemberRole) => void;
  onRemoveMember: (memberId: string, reassignOpenTasks: boolean) => void;
  onLeaveRoom: (successorLeaderId?: string) => void;
  onDeleteRoom: () => void;
  onClose: () => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  team,
  currentUserMember,
  onUpdateRoomDetails,
  onRegenerateCode,
  onAddTeammate,
  onChangeRole,
  onRemoveMember,
  onLeaveRoom,
  onDeleteRoom,
  onClose,
}) => {
  const [roomName, setRoomName] = useState(team.name);
  const [courseTag, setCourseTag] = useState(team.course ?? '');
  const [savedNotice, setSavedNotice] = useState(false);

  const [newTeammateName, setNewTeammateName] = useState('');
  const [newTeammateRole, setNewTeammateRole] = useState<MemberRole>('member');
  const [copied, setCopied] = useState(false);

  const [confirmLeave, setConfirmLeave] = useState(false);
  const [successorId, setSuccessorId] = useState<string>(() => {
    const others = team.members.filter((m) => m.id !== currentUserMember.id);
    const mod = others.find((m) => m.role === 'moderator');
    return mod?.id ?? others[0]?.id ?? '';
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLeader = currentUserMember.role === 'leader';
  const isModerator = currentUserMember.role === 'moderator';
  const canManageRoom = isLeader || isModerator;
  const hasAnyLeader = team.members.some((m) => m.role === 'leader');
  const canDeleteRoom = isLeader || (!hasAnyLeader && isModerator);

  const otherMembers = team.members.filter((m) => m.id !== currentUserMember.id);
  const isSoleLeaderWithOthers =
    isLeader &&
    otherMembers.length > 0 &&
    !otherMembers.some((m) => m.role === 'leader');

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoom) return;
    const cleanName = roomName.trim();
    if (!cleanName) return;
    onUpdateRoomDetails(cleanName, courseTag.trim());
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoom) return;
    const clean = newTeammateName.trim();
    if (!clean) return;
    onAddTeammate(clean, newTeammateRole);
    setNewTeammateName('');
    setNewTeammateRole('member');
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(team.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-settings-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div>
            <h2
              id="room-settings-title"
              className="text-lg font-display font-bold text-[var(--text-heading)]"
            >
              Room Settings · {team.name}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Your role in this room:{' '}
              <span className="font-semibold text-[var(--text-heading)]">
                {roleLabel(currentUserMember.role)}
              </span>
              {!canManageRoom && ' · View-only for room settings and role assignments'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room settings"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card-bg)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Room Details & Invite Code */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Room Info & Invite Code
              </h3>
              {!canManageRoom && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <Lock className="w-3 h-3" />
                  <span>Leader / Moderator only</span>
                </span>
              )}
            </div>

            <form
              onSubmit={handleSaveDetails}
              className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="room-name-edit"
                    className="block text-xs font-medium text-[var(--text-muted)] mb-1"
                  >
                    Room name
                  </label>
                  <input
                    id="room-name-edit"
                    type="text"
                    value={roomName}
                    disabled={!canManageRoom}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] disabled:opacity-60 focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="room-course-edit"
                    className="block text-xs font-medium text-[var(--text-muted)] mb-1"
                  >
                    Course / Subject tag
                  </label>
                  <input
                    id="room-course-edit"
                    type="text"
                    value={courseTag}
                    disabled={!canManageRoom}
                    onChange={(e) => setCourseTag(e.target.value)}
                    placeholder="e.g. CS-304 · Database Systems"
                    className="w-full h-9 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] disabled:opacity-60 focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">Invite code:</span>
                  <code className="font-mono-tabular text-xs font-bold text-[var(--text-heading)] px-2 py-1 rounded bg-[var(--rail-bg)]">
                    {team.code}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyInvite}
                    className="h-7 px-2.5 rounded bg-[var(--sidebar-bg)] hover:bg-[var(--card-hover)] text-xs font-medium text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {canManageRoom && (
                    <button
                      type="button"
                      onClick={onRegenerateCode}
                      title="Generate new invite code"
                      className="h-7 px-2.5 rounded bg-[var(--sidebar-bg)] hover:bg-[var(--card-hover)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>

                {canManageRoom && (
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg text-xs font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {savedNotice ? 'Saved!' : 'Save room info'}
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Manage People & Assign Roles */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                People & Roles ({team.members.length})
              </h3>
              {!canManageRoom && (
                <span className="text-[11px] text-[var(--text-muted)]">
                  Only leaders & moderators can assign roles or remove people
                </span>
              )}
            </div>

            {canManageRoom && (
              <form
                onSubmit={handleAddPerson}
                className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] flex flex-col sm:flex-row gap-2"
              >
                <label htmlFor="add-member-name" className="sr-only">
                  Teammate name
                </label>
                <input
                  id="add-member-name"
                  type="text"
                  value={newTeammateName}
                  onChange={(e) => setNewTeammateName(e.target.value)}
                  placeholder="Add teammate by name (e.g. Kabir)"
                  className="flex-1 h-9 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                <select
                  aria-label="Initial role for new teammate"
                  value={newTeammateRole}
                  onChange={(e) => setNewTeammateRole(e.target.value as MemberRole)}
                  className="h-9 px-2.5 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                </select>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add person</span>
                </button>
              </form>
            )}

            <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
              {team.members.map((m) => {
                const isSelf = m.id === currentUserMember.id;
                const canEditThisRole =
                  !isSelf && (isLeader || (isModerator && m.role !== 'leader'));
                const canRemoveThis =
                  !isSelf && (isLeader || (isModerator && m.role === 'member'));

                return (
                  <div
                    key={m.id}
                    className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={m.name}
                        color={m.color}
                        avatarUrl={m.avatarUrl}
                        status={m.status}
                        size="sm"
                        showStatusDot
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[var(--text-heading)] truncate">
                            {m.name}
                          </span>
                          {isSelf && (
                            <span className="text-[11px] text-[var(--text-muted)]">(you)</span>
                          )}
                          {m.role === 'leader' && (
                            <Crown className="w-3.5 h-3.5 text-[var(--warning)] shrink-0" />
                          )}
                          {m.role === 'moderator' && (
                            <Shield className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {roleLabel(m.role)}
                          {m.major ? ` · ${m.major}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {canEditThisRole ? (
                        <select
                          aria-label={`Change role for ${m.name}`}
                          value={m.role}
                          onChange={(e) =>
                            onChangeRole(m.id, e.target.value as MemberRole)
                          }
                          className="h-8 px-2.5 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          {isLeader && <option value="leader">Leader (Transfer)</option>}
                        </select>
                      ) : (
                        <span className="text-xs font-medium text-[var(--text-muted)] px-2">
                          {roleLabel(m.role)}
                        </span>
                      )}

                      {canRemoveThis && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id, true)}
                          aria-label={`Remove ${m.name} from room`}
                          title={`Remove ${m.name} from room`}
                          className="h-8 px-2.5 rounded-lg bg-[var(--danger)]/10 hover:bg-[var(--danger)] text-[var(--danger)] hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Leave Room & Delete Room Actions */}
          <section className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--danger)]">
              Leave or Delete Room
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Leave Room Card */}
              <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] space-y-3">
                <div>
                  <div className="text-sm font-bold text-[var(--text-heading)]">Leave Room</div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Remove yourself from this room. You can rejoin later with the invite code if the room stays active.
                  </p>
                </div>

                {!confirmLeave ? (
                  <button
                    type="button"
                    onClick={() => setConfirmLeave(true)}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--sidebar-bg)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-heading)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Leave {team.name}</span>
                  </button>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {isSoleLeaderWithOthers && (
                      <div>
                        <label
                          htmlFor="successor-leader"
                          className="block text-[11px] font-medium text-[var(--warning)] mb-1"
                        >
                          Choose new room Leader before leaving:
                        </label>
                        <select
                          id="successor-leader"
                          value={successorId}
                          onChange={(e) => setSuccessorId(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)]"
                        >
                          {otherMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({roleLabel(m.role)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onLeaveRoom(isSoleLeaderWithOthers ? successorId : undefined);
                          onClose();
                        }}
                        className="flex-1 h-8 rounded-lg bg-[var(--warning)] text-black text-xs font-bold cursor-pointer"
                      >
                        Confirm leave
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmLeave(false)}
                        className="h-8 px-3 rounded-lg bg-[var(--sidebar-bg)] text-xs text-[var(--text-primary)] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Room Card */}
              <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--danger)]/30 space-y-3">
                <div>
                  <div className="text-sm font-bold text-[var(--text-heading)]">Delete Room</div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {canDeleteRoom
                      ? 'Permanently delete this project room, tasks, chat history, and ratings.'
                      : 'Only the room Leader can permanently delete this room.'}
                  </p>
                </div>

                {canDeleteRoom ? (
                  !confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full h-9 px-3 rounded-lg bg-[var(--danger)]/15 hover:bg-[var(--danger)] text-[var(--danger)] hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete room</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-[var(--danger)]">
                        This action cannot be undone.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteRoom();
                            onClose();
                          }}
                          className="flex-1 h-8 rounded-lg bg-[var(--danger)] text-white text-xs font-bold cursor-pointer"
                        >
                          Delete permanently
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="h-8 px-3 rounded-lg bg-[var(--sidebar-bg)] text-xs text-[var(--text-primary)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="h-9 px-3 rounded-lg bg-[var(--rail-bg)] text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Leader permission required</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
