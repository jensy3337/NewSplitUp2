import React, { useState } from 'react';
import { X, PlusCircle, LogIn } from 'lucide-react';
import { addDaysYYYYMMDD } from '../../utils/storage';

interface CreateJoinRoomModalProps {
  onCreateRoom: (
    projectName: string,
    course: string,
    teammateNames: string[],
    deadline: string
  ) => void;
  onJoinRoom: (code: string) => string | null;
  onClose: () => void;
}

export const CreateJoinRoomModal: React.FC<CreateJoinRoomModalProps> = ({
  onCreateRoom,
  onJoinRoom,
  onClose,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [projectName, setProjectName] = useState('');
  const [course, setCourse] = useState('');
  const [teammatesRaw, setTeammatesRaw] = useState('');
  const [deadline, setDeadline] = useState(addDaysYYYYMMDD(14));

  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = projectName.trim();
    if (!cleanName) return;
    const names = teammatesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onCreateRoom(cleanName, course.trim(), names, deadline || addDaysYYYYMMDD(14));
    onClose();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const err = onJoinRoom(inviteCode);
    if (err) {
      setJoinError(err);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-join-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2
            id="create-join-title"
            className="text-lg font-display font-bold text-[var(--text-heading)]"
          >
            {tab === 'create' ? 'Create a project room' : 'Join a project room'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card-bg)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setTab('create');
                setJoinError(null);
              }}
              className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'create'
                  ? 'bg-[var(--card-bg)] text-[var(--text-heading)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create team</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('join')}
              className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'join'
                  ? 'bg-[var(--card-bg)] text-[var(--text-heading)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Join by code</span>
            </button>
          </div>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="create-project-name"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
              >
                Project name
              </label>
              <input
                id="create-project-name"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Operating Systems Lab"
                className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="create-course"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
              >
                Course code (optional)
              </label>
              <input
                id="create-course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CS-402"
                className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="create-teammates"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
              >
                Teammate names (comma-separated)
              </label>
              <input
                id="create-teammates"
                type="text"
                value={teammatesRaw}
                onChange={(e) => setTeammatesRaw(e.target.value)}
                placeholder="e.g. Priya, Arjun, Sam"
                className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                You are automatically added as the room Leader.
              </p>
            </div>

            <div>
              <label
                htmlFor="create-deadline"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
              >
                Submission deadline
              </label>
              <input
                id="create-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm font-mono-tabular text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-lg bg-[var(--card-bg)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Create team
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="join-code-input"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
              >
                Invite code
              </label>
              <input
                id="join-code-input"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setJoinError(null);
                }}
                placeholder="e.g. DBMS-482"
                className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm font-mono-tabular uppercase text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
              {joinError && (
                <p role="alert" className="text-xs text-[var(--danger)] mt-2 font-medium">
                  {joinError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-lg bg-[var(--card-bg)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Join team
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
