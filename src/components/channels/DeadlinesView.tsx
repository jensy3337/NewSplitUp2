import React from 'react';
import { Calendar, AlertTriangle, Check } from 'lucide-react';
import { Team } from '../../types';
import { daysUntil, formatShortDate } from '../../utils/storage';
import { Avatar } from '../Avatar';

interface DeadlinesViewProps {
  team: Team;
  onUpdateDeadline: (newDeadline: string) => void;
  onMarkTaskDone: (taskId: string) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  team,
  onUpdateDeadline,
  onMarkTaskDone,
}) => {
  const daysLeft = daysUntil(team.deadline);

  let statusColor = 'var(--success)';
  let countdownHeadline = `${daysLeft} days left`;
  let countdownNote = 'On track before the submission deadline.';

  if (daysLeft < 0) {
    statusColor = 'var(--danger)';
    const lateDays = Math.abs(daysLeft);
    countdownHeadline = `${lateDays} ${lateDays === 1 ? 'day' : 'days'} late`;
    countdownNote = 'Submission deadline has passed.';
  } else if (daysLeft <= 3) {
    statusColor = 'var(--warning)';
    countdownHeadline =
      daysLeft === 0 ? 'Due today' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
    countdownNote = 'Final stretch — prioritize remaining open tasks.';
  }

  const openTasks = [...team.tasks]
    .filter((t) => t.status !== 2)
    .sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl space-y-6">
      {/* Countdown Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Project Submission Countdown
          </div>
          <div
            className="text-3xl sm:text-4xl font-display font-extrabold tabular-nums"
            style={{ color: statusColor }}
          >
            {countdownHeadline}
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-primary)]">{countdownNote}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] shrink-0">
          <label
            htmlFor="project-deadline-input"
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Submission date</span>
          </label>
          <input
            id="project-deadline-input"
            type="date"
            value={team.deadline}
            onChange={(e) => {
              if (e.target.value) onUpdateDeadline(e.target.value);
            }}
            className="h-9 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm font-mono-tabular text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* Open Tasks Sorted by Due Date */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text-heading)]">
            Open tasks by due date ({openTasks.length})
          </h2>
        </div>

        {openTasks.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] text-center">
            <p className="text-sm font-semibold text-[var(--text-heading)]">
              All tasks are finished
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Every task in this room has reached Done. Ready for submission.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            {openTasks.map((task) => {
              const member = team.members.find(
                (m) => m.id === task.assigneeId || m.name === task.assignee
              );
              const assigneeName = member?.name ?? task.assignee;
              const diff = daysUntil(task.due);
              const isOverdue = diff < 0;

              return (
                <div
                  key={task.id}
                  className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--text-heading)]">
                        {task.title}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--danger)]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Overdue ({Math.abs(diff)}d)</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
                        <Avatar
                          name={assigneeName}
                          color={member?.color}
                          avatarUrl={member?.avatarUrl}
                          size="xs"
                        />
                        <span>{assigneeName}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{task.status === 0 ? 'To do' : 'In progress'}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-mono-tabular ${
                          isOverdue ? 'text-[var(--danger)] font-semibold' : ''
                        }`}
                      >
                        Due {formatShortDate(task.due)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onMarkTaskDone(task.id)}
                    className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-[var(--sidebar-bg)] hover:bg-[var(--success)] hover:text-white border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-heading)] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
