import React from 'react';
import { Lock, Star, GraduationCap } from 'lucide-react';
import { Member, Team } from '../../types';
import { Avatar } from '../Avatar';
import { roleLabel } from '../../utils/storage';

interface PeerFeedbackViewProps {
  team: Team;
  currentUserMember: Member;
  onRateMember: (memberKey: string, rating: number) => void;
}

export const PeerFeedbackView: React.FC<PeerFeedbackViewProps> = ({
  team,
  currentUserMember,
  onRateMember,
}) => {
  const teammates = team.members.filter((m) => m.id !== currentUserMember.id);

  const getRating = (m: Member): number => {
    return team.fb[m.id] ?? team.fb[m.name] ?? 0;
  };

  const ratedTeammates = teammates.filter((m) => getRating(m) > 0);
  const hasAnyRating = ratedTeammates.length > 0;

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl space-y-6">
      {/* Privacy Explanation */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] flex items-start gap-3">
        <Lock className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-[var(--text-heading)]">
            Private Peer Rating
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
            Rate each teammate from 1 to 5 stars on reliability and collaboration. Individual ratings are private—the instructor only sees averaged team scores.
          </p>
        </div>
      </div>

      {/* Teammate Rating List */}
      {teammates.length === 0 ? (
        <div className="p-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] text-center">
          <p className="text-sm font-semibold text-[var(--text-heading)]">
            No teammates to rate yet
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Share the invite code <span className="font-mono-tabular font-semibold">{team.code}</span> or add teammates from Room Settings.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
          {teammates.map((member) => {
            const currentRating = getRating(member);
            return (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
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
                    <div className="text-sm font-semibold text-[var(--text-heading)] truncate">
                      {member.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {roleLabel(member.role)}
                      {member.major ? ` · ${member.major}` : ''}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5"
                  role="radiogroup"
                  aria-label={`Rate ${member.name} from 1 to 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= currentRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={currentRating === star}
                        aria-label={`${star} ${star === 1 ? 'star' : 'stars'} for ${member.name}`}
                        onClick={() => onRateMember(member.id, star)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            active
                              ? 'fill-[var(--warning)] text-[var(--warning)]'
                              : 'text-[var(--text-muted)]'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-mono-tabular text-[var(--text-muted)] w-10 text-right">
                    {currentRating > 0 ? `${currentRating}.0` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher View Summary Card */}
      {hasAnyRating && (
        <section
          aria-label="Teacher view"
          className="p-5 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] space-y-3"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--text-heading)]">Teacher view</h3>
            <span className="text-xs text-[var(--text-muted)]">· Averaged teammate scores</span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {teammates.map((member) => {
              const score = getRating(member);
              return (
                <div
                  key={`teacher-${member.id}`}
                  className="py-2.5 flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-[var(--text-primary)]">{member.name}</span>
                  <span className="font-mono-tabular font-semibold text-[var(--text-heading)]">
                    {score > 0 ? `${score.toFixed(1)} / 5.0` : 'Not yet rated'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
