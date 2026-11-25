import React, { useState } from 'react';
import { X, Crown, Shield, UserMinus, Edit3, Lock } from 'lucide-react';
import { Member, MemberRole, Team } from '../../types';
import { roleLabel, statusLabel } from '../../utils/storage';
import { Avatar } from '../Avatar';

interface MemberDetailModalProps {
  member: Member;
  team: Team;
  currentUserMember: Member;
  onChangeRole: (memberId: string, newRole: MemberRole) => void;
  onRemoveMember: (memberId: string, reassignOpenTasks: boolean) => void;
  onOpenMyProfile: () => void;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  team,
  currentUserMember,
  onChangeRole,
  onRemoveMember,
  onOpenMyProfile,
  onClose,
}) => {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [reassignTasks, setReassignTasks] = useState(true);
  const [confirmTransferLeader, setConfirmTransferLeader] = useState(false);

  const isSelf = member.id === currentUserMember.id;
  const isLeader = currentUserMember.role === 'leader';
  const isModerator = currentUserMember.role === 'moderator';
  const canManageRoles =
    !isSelf &&
    (isLeader || (isModerator && member.role !== 'leader'));

  const canRemoveThisMember =
    !isSelf &&
    (isLeader || (isModerator && member.role === 'member'));

  const assignedTasks = team.tasks.filter(
    (t) => t.assigneeId === member.id || t.assignee === member.name
  );
  const doneCount = assignedTasks.filter((t) => t.status === 2).length;
  const openCount = assignedTasks.length - doneCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Top Accent Banner */}
        <div
          className="h-16 relative"
          style={{ backgroundColor: member.color }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close member profile"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/35 text-white hover:bg-black/55 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="-mt-10 mb-3 flex items-end justify-between gap-3">
            <div className="rounded-full p-1 bg-[var(--sidebar-bg)] inline-block">
              <Avatar
                name={member.name}
                color={member.color}
                avatarUrl={member.avatarUrl}
                status={member.status}
                size="xl"
                showStatusDot
              />
            </div>

            {isSelf && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMyProfile();
                }}
                className="h-9 px-3.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit My Profile</span>
              </button>
            )}
          </div>

          {/* Member Identity */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                id="member-modal-title"
                className="text-xl font-display font-bold text-[var(--text-heading)]"
              >
                {member.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)]">
                {member.role === 'leader' && (
                  <Crown className="w-3.5 h-3.5 text-[var(--warning)]" />
                )}
                {member.role === 'moderator' && (
                  <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
                )}
                <span>{roleLabel(member.role)}</span>
              </span>
            </div>

            <div className="text-xs text-[var(--text-muted)]">
              {statusLabel(member.status)}
              {member.major ? ` · ${member.major}` : ''}
              {member.year ? ` · ${member.year}` : ''}
            </div>
          </div>

          {member.bio && (
            <p className="mt-3 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed">
              {member.bio}
            </p>
          )}

          {/* Task Stats in This Room */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)]">
              <div className="text-[11px] text-[var(--text-muted)]">Completed in room</div>
              <div className="text-lg font-display font-bold text-[var(--text-heading)] tabular-nums">
                {doneCount} / {assignedTasks.length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)]">
              <div className="text-[11px] text-[var(--text-muted)]">Open tasks</div>
              <div className="text-lg font-display font-bold text-[var(--text-heading)] tabular-nums">
                {openCount}
              </div>
            </div>
          </div>

          {/* Role Assignment & Removal Controls (Leader & Moderators only) */}
          {!isSelf && (
            <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] space-y-3">
              {canManageRoles ? (
                <>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-heading)] mb-2">
                      Assign room role
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['moderator', 'member'] as MemberRole[]).map((r) => {
                        const active = member.role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onChangeRole(member.id, r)}
                            className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              active
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-heading)]'
                                : 'border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                            }`}
                          >
                            {roleLabel(r)}
                          </button>
                        );
                      })}
                    </div>

                    {isLeader && member.role !== 'leader' && (
                      <div className="mt-2">
                        {!confirmTransferLeader ? (
                          <button
                            type="button"
                            onClick={() => setConfirmTransferLeader(true)}
                            className="text-xs font-medium text-[var(--warning)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>Transfer Leader ownership to {member.name}</span>
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30 flex items-center justify-between gap-2">
                            <span className="text-xs text-[var(--text-heading)]">
                              Make {member.name} Leader?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onChangeRole(member.id, 'leader');
                                  setConfirmTransferLeader(false);
                                }}
                                className="px-2.5 py-1 rounded bg-[var(--warning)] text-black text-xs font-bold cursor-pointer"
                              >
                                Transfer
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmTransferLeader(false)}
                                className="px-2 py-1 rounded bg-[var(--card-bg)] text-xs text-[var(--text-primary)] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {canRemoveThisMember && (
                    <div className="pt-2">
                      {!confirmRemove ? (
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(true)}
                          className="w-full h-9 px-3 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 hover:bg-[var(--danger)] hover:text-white text-xs font-semibold text-[var(--danger)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Remove {member.name} from room</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 space-y-2.5">
                          <p className="text-xs font-semibold text-[var(--text-heading)]">
                            Remove {member.name} from {team.name}?
                          </p>
                          {openCount > 0 && (
                            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={reassignTasks}
                                onChange={(e) => setReassignTasks(e.target.checked)}
                                className="rounded accent-[var(--accent)]"
                              />
                              <span>
                                Reassign {openCount} open {openCount === 1 ? 'task' : 'tasks'} to {currentUserMember.name}
                              </span>
                            </label>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveMember(member.id, reassignTasks);
                                onClose();
                              }}
                              className="flex-1 h-8 rounded-md bg-[var(--danger)] text-white text-xs font-semibold cursor-pointer"
                            >
                              Confirm removal
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemove(false)}
                              className="h-8 px-3 rounded-md bg-[var(--card-bg)] text-xs font-medium text-[var(--text-primary)] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Only room leaders and moderators can assign roles or remove members.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
