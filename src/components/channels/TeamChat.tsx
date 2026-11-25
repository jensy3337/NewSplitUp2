import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Terminal } from 'lucide-react';
import { Member, Team } from '../../types';
import { Avatar } from '../Avatar';
import { roleLabel } from '../../utils/storage';

interface TeamChatProps {
  team: Team;
  currentUserMember: Member;
  onSendMessage: (text: string) => void;
  onDeleteMessage: (msgId: string) => void;
}

export const TeamChat: React.FC<TeamChatProps> = ({
  team,
  currentUserMember,
  onSendMessage,
  onDeleteMessage,
}) => {
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [team.msgs.length, team.id]);

  const canModerate =
    currentUserMember.role === 'leader' || currentUserMember.role === 'moderator';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setDraft('');
  };

  const insertTaskTemplate = () => {
    const firstTeammate = team.members[0]?.name ?? currentUserMember.name;
    setDraft(`/task Review draft @${firstTeammate}`);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {team.msgs.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto">
            <p className="text-sm font-medium text-[var(--text-heading)]">
              No messages in {team.name} yet.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Say hello to your teammates or type <code className="font-mono-tabular">/task Title @name</code> to create a task from chat.
            </p>
          </div>
        ) : (
          team.msgs.map((msg) => {
            const matchedMember = msg.isBot
              ? undefined
              : team.members.find(
                  (m) =>
                    (msg.authorId && m.id === msg.authorId) ||
                    m.name.toLowerCase() === msg.author.toLowerCase()
                );

            const displayName = matchedMember ? matchedMember.name : msg.author;
            const isOwn = matchedMember?.id === currentUserMember.id;
            const canDelete = !msg.isBot && (isOwn || canModerate);

            return (
              <div
                key={msg.id}
                className="group flex items-start gap-3 px-2 py-1.5 -mx-2 rounded-lg hover:bg-[var(--card-bg)]/50 transition-colors"
              >
                <Avatar
                  name={displayName}
                  color={matchedMember?.color ?? '#747f8d'}
                  avatarUrl={matchedMember?.avatarUrl}
                  isBot={msg.isBot}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: msg.isBot
                          ? 'var(--accent)'
                          : matchedMember?.color ?? 'var(--text-heading)',
                      }}
                    >
                      {displayName}
                    </span>
                    {msg.isBot && (
                      <span
                        className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        BOT
                      </span>
                    )}
                    {!msg.isBot && matchedMember && matchedMember.role !== 'member' && (
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">
                        {roleLabel(matchedMember.role)}
                      </span>
                    )}
                    <span className="text-[11px] font-mono-tabular text-[var(--text-muted)]">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words mt-0.5">
                    {msg.text}
                  </p>
                </div>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(msg.id)}
                    aria-label="Delete message"
                    title="Delete message"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--card-bg)] transition-all shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Message Composer */}
      <div className="px-4 sm:px-6 pb-4 pt-2 border-t border-[var(--border-subtle)] bg-[var(--main-bg)] shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={insertTaskTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>
              Tip: Use <code className="font-mono-tabular text-[var(--text-primary)]">/task Title @name</code> to assign tasks from chat
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="chat-composer" className="sr-only">
            Message #{team.name}
          </label>
          <input
            id="chat-composer"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message #team-chat or type /task Title @${currentUserMember.name}`}
            className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] text-sm text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className="h-11 px-4 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
