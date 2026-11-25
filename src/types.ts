export type MemberRole = 'leader' | 'moderator' | 'member';

export type AvailabilityStatus = 'online' | 'studying' | 'focus' | 'away';

export type ThemeMode = 'system' | 'dark' | 'light';

export type AccentPreset = 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose';

export type ChannelId =
  | 'team-chat'
  | 'task-board'
  | 'contributions'
  | 'deadlines'
  | 'peer-feedback';

export type TaskStatus = 0 | 1 | 2; // 0: To do, 1: In progress, 2: Done

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarColor: string;
  major: string;
  year: string;
  bio: string;
  status: AvailabilityStatus;
  themeMode: ThemeMode;
  accentPreset: AccentPreset;
}

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  color: string;
  avatarUrl?: string;
  major?: string;
  year?: string;
  bio?: string;
  status: AvailabilityStatus;
  isCurrentUser?: boolean;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  assignee: string;
  status: TaskStatus;
  due: string; // YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  authorId?: string;
  author: string;
  text: string;
  time: string;
  isBot?: boolean;
}

export interface Team {
  id: string;
  name: string;
  course?: string;
  code: string;
  deadline: string; // YYYY-MM-DD
  members: Member[];
  tasks: Task[];
  msgs: ChatMessage[];
  fb: Record<string, number>; // keyed by memberId or memberName
}

export interface AppState {
  profile: UserProfile;
  teams: Team[];
  leftTeams: Team[];
  activeTeamIndex: number;
  activeChannel: ChannelId;
}
