import React, { useMemo, useState } from 'react';
import { Plus, ArrowRight, Search, Trash2, AlertTriangle } from 'lucide-react';
import { Member, TaskStatus, Team } from '../../types';
import { addDaysYYYYMMDD, daysUntil, formatShortDate } from '../../utils/storage';
import { Avatar } from '../Avatar';

interface TaskBoardProps {
  team: Team;
  currentUserMember: Member;
  onAddTask: (title: string, assigneeId: string, due: string) => void;
  onAdvanceTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

type TaskFilter = 'all' | 'mine' | 'overdue';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 0, title: 'To do' },
  { status: 1, title: 'In progress' },
  { status: 2, title: 'Done' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  team,
  currentUserMember,
  onAddTask,
  onAdvanceTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(currentUserMember.id);
  const [due, setDue] = useState(addDaysYYYYMMDD(7));
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');

  const canModerate =
    currentUserMember.role === 'leader' || currentUserMember.role === 'moderator';

  const validAssigneeId = team.members.some((m) => m.id === assigneeId)
    ? assigneeId
    : team.members[0]?.id ?? currentUserMember.id;

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return team.tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.assignee.toLowerCase().includes(q)) {
        return false;
      }
      if (filter === 'mine') {
        return t.assigneeId === currentUserMember.id || t.assignee === currentUserMember.name;
      }
      if (filter === 'overdue') {
        return t.status !== 2 && daysUntil(t.due) < 0;
      }
      return true;
    });
  }, [team.tasks, search, filter, currentUserMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask(trimmed, validAssigneeId, due || addDaysYYYYMMDD(7));
    setTitle('');
    setDue(addDaysYYYYMMDD(7));
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Add Task Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-[1fr_170px_155px_auto] gap-3 items-end"
      >
        <div>
          <label
            htmlFor="new-task-title"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
          >
            Task title
          </label>
          <input
            id="new-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finalize slide deck charts"
            required
            className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label
            htmlFor="new-task-assignee"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
          >
            Assignee
          </label>
          <select
            id="new-task-assignee"
            value={validAssigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
          >
            {team.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.isCurrentUser ? '(you)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="new-task-due"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
          >
            Due date
          </label>
          <input
            id="new-task-due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm font-mono-tabular text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <button
          type="submit"
          className="h-10 px-4 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-95 cursor-pointer whitespace-nowrap shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add task</span>
        </button>
      </form>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] self-start"
          role="tablist"
          aria-label="Filter tasks"
        >
          {(
            [
              { id: 'all', label: 'All tasks' },
              { id: 'mine', label: 'My tasks' },
              { id: 'overdue', label: 'Overdue' },
            ] as { id: TaskFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[var(--card-bg)] text-[var(--text-heading)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="task-search" className="sr-only">
            Search tasks
          </label>
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title or teammate..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* Three-Column Kanban (Single column under 760px) */}
      {team.tasks.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-[var(--border-subtle)] text-center">
          <p className="text-sm font-semibold text-[var(--text-heading)]">No tasks created yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Use the form above or type <code className="font-mono-tabular">/task Title @name</code> in chat to add your first task.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <section
                key={col.status}
                aria-label={col.title}
                className="rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--border-subtle)]">
                  <h2 className="text-xs font-bold tracking-wide text-[var(--text-heading)]">
                    {col.title}
                  </h2>
                  <span className="text-xs font-mono-tabular font-semibold text-[var(--text-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                {colTasks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                    No {col.title.toLowerCase()} tasks
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {colTasks.map((task) => {
                      const member = team.members.find(
                        (m) => m.id === task.assigneeId || m.name === task.assignee
                      );
                      const assigneeName = member?.name ?? task.assignee;
                      const assigneeColor = member?.color ?? '#747f8d';
                      const diff = daysUntil(task.due);
                      const isOverdue = task.status !== 2 && diff < 0;
                      const canDelete =
                        canModerate ||
                        task.assigneeId === currentUserMember.id ||
                        task.assignee === currentUserMember.name;

                      return (
                        <article
                          key={task.id}
                          className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[14px] font-semibold text-[var(--text-heading)] leading-snug">
                              {task.title}
                            </h3>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => onDeleteTask(task.id)}
                                aria-label={`Delete task ${task.title}`}
                                title="Delete task"
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--sidebar-bg)] transition-colors shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Metadata row: unboxed typography with separators */}
                          <div className="flex items-center flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                              <Avatar
                                name={assigneeName}
                                color={assigneeColor}
                                avatarUrl={member?.avatarUrl}
                                size="xs"
                              />
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: assigneeColor }}
                                aria-hidden="true"
                              />
                              <span>{assigneeName}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-mono-tabular ${
                                isOverdue ? 'text-[var(--danger)] font-semibold' : ''
                              }`}
                            >
                              {formatShortDate(task.due)}
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--danger)]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Overdue</span>
                              </span>
                            )}
                          </div>

                          {/* Move forward button (only for To do and In progress) */}
                          {task.status < 2 && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => onAdvanceTask(task.id)}
                                className="w-full h-8 px-3 rounded-md bg-[var(--rail-bg)] hover:bg-[var(--accent)] text-xs font-semibold text-[var(--text-heading)] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <span>
                                  {task.status === 0 ? 'Move to In progress' : 'Mark Done'}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
