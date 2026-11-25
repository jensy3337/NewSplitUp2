import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Team } from '../../types';
import { Avatar } from '../Avatar';
import { roleLabel } from '../../utils/storage';

interface ContributionsViewProps {
  team: Team;
  onGoToBoard: () => void;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({ team, onGoToBoard }) => {
  const totalTasks = team.tasks.length;
  const doneTasks = team.tasks.filter((t) => t.status === 2);
  const doneCount = doneTasks.length;
  const memberCount = Math.max(team.members.length, 1);
  const fairShare = 100 / memberCount;
  const unevenThreshold = fairShare + 20;

  const memberStats = team.members.map((member) => {
    const assigned = team.tasks.filter(
      (t) => t.assigneeId === member.id || t.assignee === member.name
    );
    const completed = assigned.filter((t) => t.status === 2);
    const open = assigned.filter((t) => t.status !== 2);
    const sharePct = doneCount > 0 ? Math.round((completed.length / doneCount) * 100) : 0;

    return {
      member,
      assignedCount: assigned.length,
      completedCount: completed.length,
      openCount: open.length,
      sharePct,
    };
  });

  const overloadedMembers =
    doneCount >= 3
      ? memberStats.filter((s) => s.sharePct > unevenThreshold)
      : [];

  const zeroFinishedMembers = memberStats.filter(
    (s) => s.assignedCount > 0 && s.completedCount === 0
  );

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl space-y-6">
      {/* Summary Header */}
      <div className="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-muted)]">
            Team Contribution Overview
          </h2>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--text-heading)] tabular-nums">
              {doneCount}
            </span>
            <span className="text-lg font-medium text-[var(--text-muted)] tabular-nums">
              of {totalTasks} tasks done
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-[var(--text-muted)]">Equal fair share target</div>
          <div className="text-xl font-display font-bold text-[var(--text-heading)] tabular-nums">
            {Math.round(fairShare)}%{' '}
            <span className="text-xs font-normal text-[var(--text-muted)]">
              per member ({team.members.length} members)
            </span>
          </div>
        </div>
      </div>

      {/* Uneven Workload Warning */}
      {overloadedMembers.map((stat) => (
        <div
          key={`warn-over-${stat.member.id}`}
          role="alert"
          className="p-4 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-heading)]">
                Uneven workload detected · {stat.member.name} ({stat.sharePct}% of completed work)
              </h3>
              <p className="text-xs text-[var(--text-primary)] mt-1 leading-relaxed">
                With {team.members.length} members, a fair share is {Math.round(fairShare)}%.{' '}
                {stat.member.name} has finished more than {Math.round(unevenThreshold)}% of completed tasks.
                Consider moving open tasks to teammates with lighter loads.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToBoard}
            className="px-3.5 py-2 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-heading)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Review task board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Zero Completion Warning */}
      {zeroFinishedMembers.length > 0 && (
        <div
          role="status"
          className="p-4 rounded-xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[var(--text-heading)]">
              Assigned tasks with no completions yet
            </h3>
            <p className="text-xs text-[var(--text-primary)] mt-1 leading-relaxed">
              {zeroFinishedMembers
                .map((s) => `${s.member.name} (${s.assignedCount} assigned, 0 done)`)
                .join(' · ')}
              . Check in during chat or break large tasks into smaller steps.
            </p>
          </div>
        </div>
      )}

      {/* Healthy Balance Message */}
      {doneCount >= 3 &&
        overloadedMembers.length === 0 &&
        zeroFinishedMembers.length === 0 && (
          <div className="p-4 rounded-xl border border-[var(--success)]/35 bg-[var(--success)]/10 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-[var(--text-heading)]">
              Workload is balanced across the team and everyone with assigned tasks has completed work.
            </p>
          </div>
        )}

      {/* Member Breakdown Rows */}
      <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
        {memberStats.map(({ member, assignedCount, completedCount, sharePct }) => (
          <div key={member.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={member.name}
                  color={member.color}
                  avatarUrl={member.avatarUrl}
                  status={member.status}
                  size="md"
                  showStatusDot
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-heading)] truncate">
                      {member.name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {roleLabel(member.role)}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] tabular-nums">
                    ({completedCount} of {assignedCount} assigned tasks)
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-display font-bold text-[var(--text-heading)] tabular-nums">
                  {sharePct}%
                </span>
                <div className="text-[11px] text-[var(--text-muted)]">of done work</div>
              </div>
            </div>

            <div
              className="w-full h-2.5 rounded-full bg-[var(--rail-bg)] overflow-hidden"
              role="progressbar"
              aria-valuenow={sharePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${member.name} completed ${sharePct}% of team tasks`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${sharePct}%`,
                  backgroundColor: member.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
