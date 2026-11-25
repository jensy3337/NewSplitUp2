import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AccentPreset, AvailabilityStatus, ThemeMode, UserProfile } from '../../types';
import { ACCENT_OPTIONS, AVATAR_PRESETS, MEMBER_COLOR_PALETTE } from '../../data/demoData';
import { compressAvatarFile, statusLabel } from '../../utils/storage';
import { Avatar } from '../Avatar';

interface ProfileModalProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onResetDemo: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS: AvailabilityStatus[] = ['online', 'studying', 'focus', 'away'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onSave,
  onResetDemo,
  onClose,
}) => {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a JPG, PNG, or WebP image.');
      return;
    }
    try {
      const dataUrl = await compressAvatarFile(file);
      setDraft((prev) => ({ ...prev, avatarUrl: dataUrl }));
    } catch {
      setUploadError('Could not process that image. Try a smaller photo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = draft.name.trim() || 'Student';
    onSave({
      ...draft,
      name: cleanName,
      major: draft.major.trim(),
      year: draft.year.trim(),
      bio: draft.bio.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div>
            <h2
              id="profile-modal-title"
              className="text-lg font-display font-bold text-[var(--text-heading)]"
            >
              Customize Your Student Profile
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Everyone can update their own name, profile picture, bio, status, and theme preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile editor"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card-bg)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Profile Picture Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Profile Picture
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)]">
              <Avatar
                name={draft.name || 'You'}
                color={draft.avatarColor}
                avatarUrl={draft.avatarUrl}
                status={draft.status}
                size="xl"
                showStatusDot
              />

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload photo</span>
                  </button>

                  {draft.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, avatarUrl: undefined }))}
                      className="h-9 px-3 rounded-lg bg-[var(--sidebar-bg)] hover:bg-[var(--card-hover)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Use initials</span>
                    </button>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-[var(--danger)]">{uploadError}</p>
                )}

                <div>
                  <div className="text-[11px] text-[var(--text-muted)] mb-1.5">
                    Or choose a student avatar:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((preset) => {
                      const selected = draft.avatarUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({ ...prev, avatarUrl: preset.url }))
                          }
                          title={preset.label}
                          aria-label={`Choose ${preset.label} avatar`}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                            selected
                              ? 'border-[var(--accent)] scale-105'
                              : 'border-transparent hover:border-[var(--text-muted)]'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Identity & Student Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Student Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                >
                  Display name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  maxLength={32}
                  required
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-status"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                >
                  Current status
                </label>
                <select
                  id="profile-status"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      status: e.target.value as AvailabilityStatus,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {statusLabel(st)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-major"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                >
                  Major / Department
                </label>
                <input
                  id="profile-major"
                  type="text"
                  maxLength={48}
                  value={draft.major}
                  onChange={(e) => setDraft((prev) => ({ ...prev, major: e.target.value }))}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-year"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                >
                  Year / Semester
                </label>
                <input
                  id="profile-year"
                  type="text"
                  maxLength={32}
                  value={draft.year}
                  onChange={(e) => setDraft((prev) => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g. Junior · Sem 5"
                  className="w-full h-10 px-3 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-bio"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
              >
                Bio & Skills
              </label>
              <textarea
                id="profile-bio"
                rows={2}
                maxLength={140}
                value={draft.bio}
                onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Share your strengths, tools, or preferred role (e.g. SQL, UI design, slides)"
                className="w-full px-3 py-2 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>

            {/* Avatar Badge Color */}
            <div>
              <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
                Profile accent color (used for initials & contribution bar)
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {MEMBER_COLOR_PALETTE.map((hex) => {
                  const selected = draft.avatarColor === hex;
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, avatarColor: hex }))}
                      aria-label={`Select color ${hex}`}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                        selected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[var(--sidebar-bg)]' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {selected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Student Color Theme Preferences */}
          <section className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Student Workspace Theme Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
                  Appearance Mode
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[var(--rail-bg)] border border-[var(--border-subtle)]">
                  {(
                    [
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'system', label: 'Auto', icon: Monitor },
                    ] as { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[]
                  ).map((mode) => {
                    const Icon = mode.icon;
                    const active = draft.themeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, themeMode: mode.id }))
                        }
                        className={`h-8 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[var(--card-bg)] text-[var(--text-heading)] shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
                  Theme Accent
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {ACCENT_OPTIONS.map((opt) => {
                    const active = draft.accentPreset === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            accentPreset: opt.id as AccentPreset,
                          }))
                        }
                        title={opt.label}
                        aria-label={`Select ${opt.label} theme accent`}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--text-heading)] bg-[var(--card-bg)] text-[var(--text-heading)]'
                            : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.swatch }}
                        />
                        <span>{opt.label.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Reset Demo Option */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 flex-wrap">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore initial demo rooms</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--danger)] font-medium">
                  Reset all rooms & tasks to demo defaults?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetDemo();
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-[var(--danger)] text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded bg-[var(--card-bg)] text-xs text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Save profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
