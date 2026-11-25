import React, { useEffect, useState } from 'react';
import {
  Hash,
  Users,
  Settings,
  Plus,
  Sun,
  Moon,
  Monitor,
  FolderPlus,
  RotateCcw,
} from 'lucide-react';
import {
  AppState,
  ChannelId,
  Member,
  MemberRole,
  Team,
  ThemeMode,
  UserProfile,
} from './types';
import {
  addDaysYYYYMMDD,
  generateInviteCode,
  getInitials,
  loadStoredState,
  nowTimeLabel,
  roleLabel,
  saveStoredState,
  uid,
} from './utils/storage';
import { createDemoState, MEMBER_COLOR_PALETTE } from './data/demoData';
import { TeamRail } from './components/TeamRail';
import { CHANNELS, ChannelSidebar } from './components/ChannelSidebar';
import { Avatar } from './components/Avatar';
import { TeamChat } from './components/channels/TeamChat';
import { TaskBoard } from './components/channels/TaskBoard';
import { ContributionsView } from './components/channels/ContributionsView';
import { DeadlinesView } from './components/channels/DeadlinesView';
import { PeerFeedbackView } from './components/channels/PeerFeedbackView';
import { ProfileModal } from './components/modals/ProfileModal';
import { MemberDetailModal } from './components/modals/MemberDetailModal';
import { RoomSettingsModal } from './components/modals/RoomSettingsModal';
import { CreateJoinRoomModal } from './components/modals/CreateJoinRoomModal';

const CHANNEL_DESCRIPTIONS: Record<ChannelId, string> = {
  'team-chat': 'Coordinate updates or run /task Title @name',
  'task-board': 'Split tasks across To do, In progress, and Done',
  contributions: 'Fair-share progress and workload balance alerts',
  deadlines: 'Submission countdown and open tasks sorted by due date',
  'peer-feedback': 'Private 1–5 star teammate ratings and teacher averages',
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const stored = loadStoredState();
    return stored ?? createDemoState();
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createJoinOpen, setCreateJoinOpen] = useState(false);
  const [roomSettingsOpen, setRoomSettingsOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Listen to OS color scheme changes
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'dark' | 'light' =
    state.profile.themeMode === 'system'
      ? systemPrefersDark
        ? 'dark'
        : 'light'
      : state.profile.themeMode;

  // Apply .dark class and data-accent attribute to document root
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-accent', state.profile.accentPreset || 'indigo');
  }, [resolvedTheme, state.profile.accentPreset]);

  // Persist to localStorage on every update
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  const safeTeamIndex =
    state.teams.length === 0
      ? -1
      : Math.min(Math.max(state.activeTeamIndex, 0), state.teams.length - 1);

  const activeTeam: Team | undefined =
    safeTeamIndex >= 0 ? state.teams[safeTeamIndex] : undefined;

  const currentUserMember: Member | undefined = activeTeam?.members.find(
    (m) => m.isCurrentUser || m.id === state.profile.id
  );

  const selectedMember: Member | undefined =
    activeTeam && selectedMemberId
      ? activeTeam.members.find((m) => m.id === selectedMemberId)
      : undefined;

  const updateActiveTeam = (updater: (team: Team) => Team) => {
    if (safeTeamIndex < 0) return;
    setState((prev) => {
      const idx = Math.min(Math.max(prev.activeTeamIndex, 0), prev.teams.length - 1);
      const target = prev.teams[idx];
      if (!target) return prev;
      const nextTeams = [...prev.teams];
      nextTeams[idx] = updater(target);
      return { ...prev, teams: nextTeams };
    });
  };

  // Cycle theme quickly from rail or mobile header
  const handleCycleTheme = () => {
    const order: ThemeMode[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(state.profile.themeMode) + 1) % order.length];
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, themeMode: next },
    }));
  };

  // Save user profile & sync across all rooms
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setState((prev) => {
      const syncTeam = (t: Team): Team => ({
        ...t,
        members: t.members.map((m) =>
          m.isCurrentUser || m.id === updatedProfile.id
            ? {
                ...m,
                name: updatedProfile.name,
                color: updatedProfile.avatarColor,
                avatarUrl: updatedProfile.avatarUrl,
                major: updatedProfile.major,
                year: updatedProfile.year,
                bio: updatedProfile.bio,
                status: updatedProfile.status,
                isCurrentUser: true,
              }
            : m
        ),
        tasks: t.tasks.map((task) =>
          task.assigneeId === updatedProfile.id
            ? { ...task, assignee: updatedProfile.name }
            : task
        ),
        msgs: t.msgs.map((msg) =>
          msg.authorId === updatedProfile.id
            ? { ...msg, author: updatedProfile.name }
            : msg
        ),
      });

      return {
        ...prev,
        profile: updatedProfile,
        teams: prev.teams.map(syncTeam),
        leftTeams: prev.leftTeams.map(syncTeam),
      };
    });
  };

  const handleResetDemo = () => {
    setState(createDemoState(state.profile));
  };

  // Chat & /task command
  const handleSendMessage = (text: string) => {
    if (!activeTeam || !currentUserMember) return;
    const time = nowTimeLabel();
    const userMsg = {
      id: uid('msg'),
      authorId: currentUserMember.id,
      author: currentUserMember.name,
      text,
      time,
    };

    const taskMatch = text.match(/^\/task\s+(.+)$/i);
    if (taskMatch) {
      let body = taskMatch[1].trim();
      let targetMember = currentUserMember;

      const atMatch = body.match(/\s@([^\s]+)\s*$/);
      if (atMatch) {
        const mention = atMatch[1].toLowerCase();
        body = body.slice(0, atMatch.index).trim();
        const found = activeTeam.members.find(
          (m) => m.name.toLowerCase() === mention || m.name.toLowerCase().startsWith(mention)
        );
        if (found) targetMember = found;
      }

      const taskTitle = body || 'Untitled task';
      const due = addDaysYYYYMMDD(7);

      const newTask = {
        id: uid('task'),
        title: taskTitle,
        assigneeId: targetMember.id,
        assignee: targetMember.name,
        status: 0 as const,
        due,
      };

      const botMsg = {
        id: uid('msg'),
        author: 'Taskbot',
        text: `Added "${taskTitle}" to To do for ${targetMember.name} (due ${due}).`,
        time,
        isBot: true,
      };

      updateActiveTeam((team) => ({
        ...team,
        tasks: [...team.tasks, newTask],
        msgs: [...team.msgs, userMsg, botMsg],
      }));
      return;
    }

    updateActiveTeam((team) => ({
      ...team,
      msgs: [...team.msgs, userMsg],
    }));
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!currentUserMember) return;
    const isModOrLeader =
      currentUserMember.role === 'leader' || currentUserMember.role === 'moderator';
    updateActiveTeam((team) => ({
      ...team,
      msgs: team.msgs.filter((m) => {
        if (m.id !== msgId) return true;
        const isOwn = m.authorId === currentUserMember.id;
        return !(isOwn || isModOrLeader);
      }),
    }));
  };

  // Tasks
  const handleAddTask = (title: string, assigneeId: string, due: string) => {
    if (!activeTeam) return;
    const assignee =
      activeTeam.members.find((m) => m.id === assigneeId) ?? activeTeam.members[0];
    if (!assignee) return;

    updateActiveTeam((team) => ({
      ...team,
      tasks: [
        ...team.tasks,
        {
          id: uid('task'),
          title,
          assigneeId: assignee.id,
          assignee: assignee.name,
          status: 0,
          due,
        },
      ],
    }));
  };

  const handleAdvanceTask = (taskId: string) => {
    updateActiveTeam((team) => {
      let botNotice: Team['msgs'][number] | null = null;
      const nextTasks = team.tasks.map((t) => {
        if (t.id !== taskId || t.status >= 2) return t;
        const nextStatus = (t.status + 1) as 0 | 1 | 2;
        if (nextStatus === 2) {
          const member = team.members.find(
            (m) => m.id === t.assigneeId || m.name === t.assignee
          );
          const who = member?.name ?? t.assignee;
          botNotice = {
            id: uid('msg'),
            author: 'Taskbot',
            text: `${who} finished ${t.title}. Nice work!`,
            time: nowTimeLabel(),
            isBot: true,
          };
        }
        return { ...t, status: nextStatus };
      });
      return {
        ...team,
        tasks: nextTasks,
        msgs: botNotice ? [...team.msgs, botNotice] : team.msgs,
      };
    });
  };

  const handleMarkTaskDone = (taskId: string) => {
    updateActiveTeam((team) => {
      let botNotice: Team['msgs'][number] | null = null;
      const nextTasks = team.tasks.map((t) => {
        if (t.id !== taskId || t.status === 2) return t;
        const member = team.members.find(
          (m) => m.id === t.assigneeId || m.name === t.assignee
        );
        const who = member?.name ?? t.assignee;
        botNotice = {
          id: uid('msg'),
          author: 'Taskbot',
          text: `${who} finished ${t.title}. Nice work!`,
          time: nowTimeLabel(),
          isBot: true,
        };
        return { ...t, status: 2 as const };
      });
      return {
        ...team,
        tasks: nextTasks,
        msgs: botNotice ? [...team.msgs, botNotice] : team.msgs,
      };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    updateActiveTeam((team) => ({
      ...team,
      tasks: team.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleUpdateDeadline = (newDeadline: string) => {
    updateActiveTeam((team) => ({
      ...team,
      deadline: newDeadline,
    }));
  };

  const handleRateMember = (memberId: string, rating: number) => {
    updateActiveTeam((team) => ({
      ...team,
      fb: {
        ...team.fb,
        [memberId]: rating,
      },
    }));
  };

  // Room & Role Management (Strictly gated for Leader / Moderator)
  const handleChangeMemberRole = (memberId: string, newRole: MemberRole) => {
    if (!activeTeam || !currentUserMember) return;
    const isLeader = currentUserMember.role === 'leader';
    const isModerator = currentUserMember.role === 'moderator';
    if (!isLeader && !isModerator) return;

    const target = activeTeam.members.find((m) => m.id === memberId);
    if (!target || target.id === currentUserMember.id) return;
    if (isModerator && (target.role === 'leader' || newRole === 'leader')) return;

    updateActiveTeam((team) => {
      const nextMembers = team.members.map((m) => {
        if (m.id === memberId) return { ...m, role: newRole };
        if (newRole === 'leader' && m.id === currentUserMember.id) {
          return { ...m, role: 'moderator' as MemberRole };
        }
        return m;
      });
      return {
        ...team,
        members: nextMembers,
        msgs: [
          ...team.msgs,
          {
            id: uid('msg'),
            author: 'Taskbot',
            text:
              newRole === 'leader'
                ? `${currentUserMember.name} transferred room Leadership to ${target.name}.`
                : `${currentUserMember.name} updated ${target.name}'s role to ${roleLabel(newRole)}.`,
            time: nowTimeLabel(),
            isBot: true,
          },
        ],
      };
    });
  };

  const handleRemoveMember = (memberId: string, reassignOpenTasks: boolean) => {
    if (!activeTeam || !currentUserMember) return;
    const isLeader = currentUserMember.role === 'leader';
    const isModerator = currentUserMember.role === 'moderator';
    if (!isLeader && !isModerator) return;

    const target = activeTeam.members.find((m) => m.id === memberId);
    if (!target || target.id === currentUserMember.id) return;
    if (isModerator && target.role !== 'member') return;

    updateActiveTeam((team) => {
      const nextFb = { ...team.fb };
      delete nextFb[target.id];
      delete nextFb[target.name];

      const nextTasks = team.tasks.map((t) => {
        if (t.assigneeId !== target.id && t.assignee !== target.name) return t;
        if (t.status !== 2 && reassignOpenTasks) {
          return {
            ...t,
            assigneeId: currentUserMember.id,
            assignee: currentUserMember.name,
          };
        }
        return t;
      });

      return {
        ...team,
        members: team.members.filter((m) => m.id !== target.id),
        tasks: nextTasks,
        fb: nextFb,
        msgs: [
          ...team.msgs,
          {
            id: uid('msg'),
            author: 'Taskbot',
            text: `${target.name} was removed from the room by ${currentUserMember.name}.`,
            time: nowTimeLabel(),
            isBot: true,
          },
        ],
      };
    });
  };

  const handleAddTeammate = (name: string, role: MemberRole) => {
    if (!activeTeam || !currentUserMember) return;
    if (currentUserMember.role !== 'leader' && currentUserMember.role !== 'moderator') return;

    const existing = activeTeam.members.some(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return;

    const nextColor =
      MEMBER_COLOR_PALETTE[activeTeam.members.length % MEMBER_COLOR_PALETTE.length];

    const newMember: Member = {
      id: uid('mem'),
      name,
      role: role === 'leader' ? 'member' : role,
      color: nextColor,
      status: 'online',
    };

    updateActiveTeam((team) => ({
      ...team,
      members: [...team.members, newMember],
      msgs: [
        ...team.msgs,
        {
          id: uid('msg'),
          author: 'Taskbot',
          text: `${currentUserMember.name} added ${name} as ${roleLabel(newMember.role)}.`,
          time: nowTimeLabel(),
          isBot: true,
        },
      ],
    }));
  };

  const handleUpdateRoomDetails = (name: string, course: string) => {
    if (!currentUserMember) return;
    if (currentUserMember.role !== 'leader' && currentUserMember.role !== 'moderator') return;
    updateActiveTeam((team) => ({
      ...team,
      name,
      course: course || undefined,
    }));
  };

  const handleRegenerateCode = () => {
    if (!activeTeam || !currentUserMember) return;
    if (currentUserMember.role !== 'leader' && currentUserMember.role !== 'moderator') return;
    const allCodes = [...state.teams, ...state.leftTeams].map((t) => t.code);
    const nextCode = generateInviteCode(activeTeam.name, allCodes);
    updateActiveTeam((team) => ({
      ...team,
      code: nextCode,
      msgs: [
        ...team.msgs,
        {
          id: uid('msg'),
          author: 'Taskbot',
          text: `Invite code updated to ${nextCode}.`,
          time: nowTimeLabel(),
          isBot: true,
        },
      ],
    }));
  };

  const handleLeaveRoom = (successorLeaderId?: string) => {
    if (!activeTeam || !currentUserMember) return;
    setState((prev) => {
      const idx = Math.min(Math.max(prev.activeTeamIndex, 0), prev.teams.length - 1);
      const leavingTeam = prev.teams[idx];
      if (!leavingTeam) return prev;

      const remainingMembers = leavingTeam.members
        .filter((m) => m.id !== currentUserMember.id)
        .map((m) =>
          successorLeaderId && m.id === successorLeaderId
            ? { ...m, role: 'leader' as MemberRole }
            : m
        );

      const archivedCopy: Team | null =
        remainingMembers.length > 0
          ? {
              ...leavingTeam,
              members: remainingMembers,
              msgs: [
                ...leavingTeam.msgs,
                {
                  id: uid('msg'),
                  author: 'Taskbot',
                  text: `${currentUserMember.name} left the room.`,
                  time: nowTimeLabel(),
                  isBot: true,
                },
              ],
            }
          : null;

      const nextTeams = prev.teams.filter((_, i) => i !== idx);
      const nextIndex =
        nextTeams.length === 0 ? 0 : Math.min(idx, nextTeams.length - 1);

      return {
        ...prev,
        teams: nextTeams,
        leftTeams: archivedCopy
          ? [...prev.leftTeams.filter((t) => t.id !== archivedCopy.id), archivedCopy]
          : prev.leftTeams,
        activeTeamIndex: nextIndex,
      };
    });
  };

  const handleDeleteRoom = () => {
    if (!activeTeam || !currentUserMember) return;
    const hasLeader = activeTeam.members.some((m) => m.role === 'leader');
    const allowed =
      currentUserMember.role === 'leader' ||
      (!hasLeader && currentUserMember.role === 'moderator');
    if (!allowed) return;

    setState((prev) => {
      const idx = Math.min(Math.max(prev.activeTeamIndex, 0), prev.teams.length - 1);
      const target = prev.teams[idx];
      if (!target) return prev;
      const nextTeams = prev.teams.filter((t) => t.id !== target.id);
      const nextIndex =
        nextTeams.length === 0 ? 0 : Math.min(idx, nextTeams.length - 1);
      return {
        ...prev,
        teams: nextTeams,
        leftTeams: prev.leftTeams.filter((t) => t.id !== target.id),
        activeTeamIndex: nextIndex,
      };
    });
  };

  // Create or Join Room
  const handleCreateRoom = (
    projectName: string,
    course: string,
    teammateNames: string[],
    deadline: string
  ) => {
    const allCodes = [...state.teams, ...state.leftTeams].map((t) => t.code);
    const code = generateInviteCode(projectName, allCodes);

    const leaderMember: Member = {
      id: state.profile.id,
      name: state.profile.name,
      role: 'leader',
      color: state.profile.avatarColor,
      avatarUrl: state.profile.avatarUrl,
      major: state.profile.major,
      year: state.profile.year,
      bio: state.profile.bio,
      status: state.profile.status,
      isCurrentUser: true,
    };

    const uniqueExtraNames = Array.from(
      new Set(
        teammateNames.filter(
          (n) => n.toLowerCase() !== state.profile.name.toLowerCase()
        )
      )
    );

    const extraMembers: Member[] = uniqueExtraNames.map((n, i) => ({
      id: uid('mem'),
      name: n,
      role: 'member',
      color: MEMBER_COLOR_PALETTE[(i + 1) % MEMBER_COLOR_PALETTE.length],
      status: 'online',
    }));

    const newTeam: Team = {
      id: uid('team'),
      name: projectName,
      course: course || undefined,
      code,
      deadline,
      members: [leaderMember, ...extraMembers],
      tasks: [],
      msgs: [
        {
          id: uid('msg'),
          author: 'Taskbot',
          text: `Created "${projectName}". Invite code: ${code}. You are the room Leader.`,
          time: nowTimeLabel(),
          isBot: true,
        },
      ],
      fb: {},
    };

    setState((prev) => ({
      ...prev,
      teams: [...prev.teams, newTeam],
      activeTeamIndex: prev.teams.length,
      activeChannel: 'team-chat',
    }));
  };

  const handleJoinRoom = (rawCode: string): string | null => {
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      return 'No team found with that code. Check the code and try again.';
    }

    const activeIdx = state.teams.findIndex(
      (t) => t.code.toUpperCase() === normalized
    );
    if (activeIdx >= 0) {
      setState((prev) => ({
        ...prev,
        activeTeamIndex: activeIdx,
        activeChannel: 'team-chat',
      }));
      return null;
    }

    const leftMatch = state.leftTeams.find(
      (t) => t.code.toUpperCase() === normalized
    );
    if (leftMatch) {
      const rejoinedMember: Member = {
        id: state.profile.id,
        name: state.profile.name,
        role: 'member',
        color: state.profile.avatarColor,
        avatarUrl: state.profile.avatarUrl,
        major: state.profile.major,
        year: state.profile.year,
        bio: state.profile.bio,
        status: state.profile.status,
        isCurrentUser: true,
      };
      const restoredTeam: Team = {
        ...leftMatch,
        members: [...leftMatch.members, rejoinedMember],
        msgs: [
          ...leftMatch.msgs,
          {
            id: uid('msg'),
            author: 'Taskbot',
            text: `${state.profile.name} rejoined the room.`,
            time: nowTimeLabel(),
            isBot: true,
          },
        ],
      };

      setState((prev) => ({
        ...prev,
        teams: [...prev.teams, restoredTeam],
        leftTeams: prev.leftTeams.filter((t) => t.id !== leftMatch.id),
        activeTeamIndex: prev.teams.length,
        activeChannel: 'team-chat',
      }));
      return null;
    }

    return 'No team found with that code. Check the code and try again.';
  };

  const ThemeIcon =
    state.profile.themeMode === 'system'
      ? Monitor
      : resolvedTheme === 'dark'
        ? Moon
        : Sun;

  return (
    <div className="h-dvh w-full flex flex-col md:flex-row overflow-hidden bg-[var(--main-bg)] text-[var(--text-primary)]">
      {/* Desktop Left Team Rail (72px) */}
      <TeamRail
        teams={state.teams}
        activeTeamIndex={safeTeamIndex}
        profile={state.profile}
        resolvedTheme={resolvedTheme}
        onSelectTeam={(idx) =>
          setState((prev) => ({ ...prev, activeTeamIndex: idx }))
        }
        onOpenCreateJoin={() => setCreateJoinOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onCycleTheme={handleCycleTheme}
      />

      {/* Mobile Compact Header (< 760px): Horizontal Team Tabs + Channel Tabs */}
      <div className="md:hidden shrink-0 bg-[var(--rail-bg)] border-b border-[var(--border-subtle)]">
        {/* Row 1: Rooms + Quick Actions */}
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
          <div
            className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 bg-white border border-[var(--border-subtle)]"
            title="SplitUp"
          >
            <img
              src="/favicon.ico"
              alt="SplitUp"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
            {state.teams.map((team, idx) => {
              const active = idx === safeTeamIndex;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, activeTeamIndex: idx }))
                  }
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    active
                      ? 'text-white'
                      : 'bg-[var(--card-bg)] text-[var(--text-primary)]'
                  }`}
                  style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  {getInitials(team.name)} · {team.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCreateJoinOpen(true)}
              aria-label="Create or join a project room"
              className="w-8 h-8 rounded-lg bg-[var(--card-bg)] text-[var(--success)] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCycleTheme}
            aria-label="Switch color theme"
            className="w-8 h-8 rounded-lg bg-[var(--card-bg)] text-[var(--text-muted)] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            aria-label="Customize profile"
            className="shrink-0 cursor-pointer"
          >
            <Avatar
              name={state.profile.name}
              color={state.profile.avatarColor}
              avatarUrl={state.profile.avatarUrl}
              status={state.profile.status}
              size="sm"
              showStatusDot
            />
          </button>
        </div>

        {/* Row 2: Horizontal Scrolling Channels */}
        {activeTeam && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[var(--sidebar-bg)] border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1 overflow-x-auto">
              {CHANNELS.map((ch) => {
                const active = state.activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, activeChannel: ch.id }))
                    }
                    className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-[var(--card-bg)] text-[var(--text-heading)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    # {ch.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open members and room settings"
              className="h-7 px-2 rounded-md bg-[var(--card-bg)] text-xs font-medium text-[var(--text-heading)] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums">{activeTeam.members.length}</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Channel Sidebar + Mobile Drawer */}
      <ChannelSidebar
        team={activeTeam}
        currentUserMember={currentUserMember}
        activeChannel={state.activeChannel}
        profile={state.profile}
        mobileDrawerOpen={mobileDrawerOpen}
        onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
        onSelectChannel={(ch) =>
          setState((prev) => ({ ...prev, activeChannel: ch }))
        }
        onSelectMember={(member) => setSelectedMemberId(member.id)}
        onOpenRoomSettings={() => setRoomSettingsOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col bg-[var(--main-bg)]">
        {activeTeam && currentUserMember ? (
          <>
            {/* Desktop Channel Header */}
            <header className="hidden md:flex h-14 px-6 items-center justify-between gap-4 border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Hash className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                <h1 className="text-base font-display font-bold text-[var(--text-heading)] whitespace-nowrap">
                  {state.activeChannel}
                </h1>
                <span className="text-[var(--text-muted)]" aria-hidden="true">
                  ·
                </span>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {CHANNEL_DESCRIPTIONS[state.activeChannel]}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeTeam.course && (
                  <span className="text-xs text-[var(--text-muted)] hidden lg:inline whitespace-nowrap">
                    {activeTeam.course}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setRoomSettingsOpen(true)}
                  className="h-8 px-3 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-heading)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Room Settings</span>
                </button>
              </div>
            </header>

            {/* Channel Viewport */}
            <div className="flex-1 min-h-0">
              {state.activeChannel === 'team-chat' && (
                <TeamChat
                  team={activeTeam}
                  currentUserMember={currentUserMember}
                  onSendMessage={handleSendMessage}
                  onDeleteMessage={handleDeleteMessage}
                />
              )}

              {state.activeChannel === 'task-board' && (
                <TaskBoard
                  team={activeTeam}
                  currentUserMember={currentUserMember}
                  onAddTask={handleAddTask}
                  onAdvanceTask={handleAdvanceTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {state.activeChannel === 'contributions' && (
                <ContributionsView
                  team={activeTeam}
                  onGoToBoard={() =>
                    setState((prev) => ({ ...prev, activeChannel: 'task-board' }))
                  }
                />
              )}

              {state.activeChannel === 'deadlines' && (
                <DeadlinesView
                  team={activeTeam}
                  onUpdateDeadline={handleUpdateDeadline}
                  onMarkTaskDone={handleMarkTaskDone}
                />
              )}

              {state.activeChannel === 'peer-feedback' && (
                <PeerFeedbackView
                  team={activeTeam}
                  currentUserMember={currentUserMember}
                  onRateMember={handleRateMember}
                />
              )}
            </div>
          </>
        ) : (
          /* Empty State when all rooms have been left or deleted */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full p-7 rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--border-subtle)] text-center space-y-4">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-[var(--text-heading)]">
                  No active project rooms
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1.5">
                  Create a new project room as Leader, join one using an invite code, or restore the sample rooms.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCreateJoinOpen(true)}
                  className="flex-1 h-10 px-4 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Create or Join Room
                </button>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="h-10 px-4 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-heading)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Demo</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {profileModalOpen && (
        <ProfileModal
          profile={state.profile}
          onSave={handleSaveProfile}
          onResetDemo={handleResetDemo}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {selectedMember && activeTeam && currentUserMember && (
        <MemberDetailModal
          member={selectedMember}
          team={activeTeam}
          currentUserMember={currentUserMember}
          onChangeRole={handleChangeMemberRole}
          onRemoveMember={handleRemoveMember}
          onOpenMyProfile={() => setProfileModalOpen(true)}
          onClose={() => setSelectedMemberId(null)}
        />
      )}

      {roomSettingsOpen && activeTeam && currentUserMember && (
        <RoomSettingsModal
          team={activeTeam}
          currentUserMember={currentUserMember}
          onUpdateRoomDetails={handleUpdateRoomDetails}
          onRegenerateCode={handleRegenerateCode}
          onAddTeammate={handleAddTeammate}
          onChangeRole={handleChangeMemberRole}
          onRemoveMember={handleRemoveMember}
          onLeaveRoom={handleLeaveRoom}
          onDeleteRoom={handleDeleteRoom}
          onClose={() => setRoomSettingsOpen(false)}
        />
      )}

      {createJoinOpen && (
        <CreateJoinRoomModal
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onClose={() => setCreateJoinOpen(false)}
        />
      )}
    </div>
  );
}
