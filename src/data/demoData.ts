import { AccentPreset, AppState, UserProfile } from '../types';
import { addDaysYYYYMMDD } from '../utils/storage';

export const MEMBER_COLOR_PALETTE = [
  '#5865f2',
  '#23a55a',
  '#e67e22',
  '#9b59b6',
  '#e91e63',
  '#00a8fc',
  '#14b8a6',
  '#f0b232',
];

export const AVATAR_PRESETS = [
  {
    id: 'preset-1',
    label: 'Studio Headphones',
    url: '/src/assets/images/avatar_student_one_1795630392686.jpg',
  },
  {
    id: 'preset-2',
    label: 'CS Hoodie',
    url: '/src/assets/images/avatar_student_two_1795630393532.jpg',
  },
  {
    id: 'preset-3',
    label: 'Denim Builder',
    url: '/src/assets/images/avatar_student_three_1795630394111.jpg',
  },
  {
    id: 'preset-4',
    label: 'Campus Beanie',
    url: '/src/assets/images/avatar_student_four_1795630394867.jpg',
  },
];

export const ACCENT_OPTIONS: { id: AccentPreset; label: string; swatch: string }[] = [
  { id: 'indigo', label: 'Discord Indigo', swatch: '#5865f2' },
  { id: 'emerald', label: 'Campus Sage', swatch: '#1d9a54' },
  { id: 'violet', label: 'Midnight Violet', swatch: '#7c3aed' },
  { id: 'amber', label: 'Warm Amber', swatch: '#d97706' },
  { id: 'rose', label: 'Crimson Berry', swatch: '#e11d48' },
];

export function createInitialProfile(): UserProfile {
  return {
    id: 'usr_you',
    name: 'You',
    avatarUrl: AVATAR_PRESETS[0].url,
    avatarColor: '#5865f2',
    major: 'B.Tech Computer Science',
    year: 'Junior · Sem 5',
    bio: 'Working on UI, testing, and keeping team deadlines on track.',
    status: 'online',
    themeMode: 'dark',
    accentPreset: 'indigo',
  };
}

export function createDemoState(existingProfile?: UserProfile): AppState {
  const profile = existingProfile ?? createInitialProfile();

  const youId = profile.id;
  const youName = profile.name;

  return {
    profile,
    activeTeamIndex: 0,
    activeChannel: 'team-chat',
    leftTeams: [],
    teams: [
      {
        id: 'team_dbms',
        name: 'DBMS Mini Project',
        course: 'CS-304 · Database Systems',
        code: 'DBMS-482',
        deadline: addDaysYYYYMMDD(10),
        members: [
          {
            id: youId,
            name: youName,
            role: 'leader',
            color: profile.avatarColor,
            avatarUrl: profile.avatarUrl,
            major: profile.major,
            year: profile.year,
            bio: profile.bio,
            status: profile.status,
            isCurrentUser: true,
          },
          {
            id: 'mem_aisha',
            name: 'Aisha',
            role: 'moderator',
            color: '#23a55a',
            avatarUrl: AVATAR_PRESETS[2].url,
            major: 'Computer Science',
            year: 'Junior · Sem 5',
            bio: 'ER modeling, slide design, and data normalization.',
            status: 'studying',
          },
          {
            id: 'mem_rohan',
            name: 'Rohan',
            role: 'member',
            color: '#e67e22',
            avatarUrl: AVATAR_PRESETS[1].url,
            major: 'Software Engineering',
            year: 'Junior · Sem 5',
            bio: 'SQL schemas, auth backend, and query tuning.',
            status: 'focus',
          },
          {
            id: 'mem_meera',
            name: 'Meera',
            role: 'member',
            color: '#9b59b6',
            avatarUrl: AVATAR_PRESETS[3].url,
            major: 'Information Tech',
            year: 'Junior · Sem 5',
            bio: 'Technical documentation, user testing, and reports.',
            status: 'online',
          },
        ],
        tasks: [
          {
            id: 'task_1',
            title: 'Draw ER diagram',
            assigneeId: 'mem_aisha',
            assignee: 'Aisha',
            status: 2,
            due: addDaysYYYYMMDD(-2),
          },
          {
            id: 'task_2',
            title: 'Write SQL schema',
            assigneeId: 'mem_rohan',
            assignee: 'Rohan',
            status: 2,
            due: addDaysYYYYMMDD(2),
          },
          {
            id: 'task_3',
            title: 'Build login module',
            assigneeId: 'mem_rohan',
            assignee: 'Rohan',
            status: 2,
            due: addDaysYYYYMMDD(4),
          },
          {
            id: 'task_4',
            title: 'Prepare report draft',
            assigneeId: 'mem_meera',
            assignee: 'Meera',
            status: 1,
            due: addDaysYYYYMMDD(5),
          },
          {
            id: 'task_5',
            title: 'Make presentation slides',
            assigneeId: 'mem_aisha',
            assignee: 'Aisha',
            status: 0,
            due: addDaysYYYYMMDD(7),
          },
          {
            id: 'task_6',
            title: 'Test and fix bugs',
            assigneeId: youId,
            assignee: youName,
            status: 0,
            due: addDaysYYYYMMDD(8),
          },
        ],
        msgs: [
          {
            id: 'msg_1',
            author: 'Taskbot',
            text: 'Welcome to DBMS Mini Project! Share invite code DBMS-482 with teammates or type /task Title @name to assign work.',
            time: '09:15',
            isBot: true,
          },
          {
            id: 'msg_2',
            authorId: 'mem_rohan',
            author: 'Rohan',
            text: 'SQL schema and login module are done and pushed. Can someone take a look at the bug testing task before slides?',
            time: '10:04',
          },
          {
            id: 'msg_3',
            authorId: 'mem_meera',
            author: 'Meera',
            text: 'Starting the report draft today—drop any query screenshots you want included.',
            time: '10:22',
          },
        ],
        fb: {},
      },
      {
        id: 'team_mkt',
        name: 'Marketing Case Study',
        course: 'MGT-210 · Consumer Strategy',
        code: 'MKT-204',
        deadline: addDaysYYYYMMDD(14),
        members: [
          {
            id: 'mem_dev',
            name: 'Dev',
            role: 'leader',
            color: '#00a8fc',
            avatarUrl: AVATAR_PRESETS[1].url,
            major: 'BBA Marketing',
            year: 'Sophomore · Sem 4',
            bio: 'Positioning strategy and competitor benchmarks.',
            status: 'online',
          },
          {
            id: 'mem_sana',
            name: 'Sana',
            role: 'moderator',
            color: '#e91e63',
            avatarUrl: AVATAR_PRESETS[2].url,
            major: 'Business Analytics',
            year: 'Sophomore · Sem 4',
            bio: 'Survey data analysis and pricing sensitivity.',
            status: 'studying',
          },
          {
            id: youId,
            name: youName,
            role: 'member',
            color: profile.avatarColor,
            avatarUrl: profile.avatarUrl,
            major: profile.major,
            year: profile.year,
            bio: profile.bio,
            status: profile.status,
            isCurrentUser: true,
          },
        ],
        tasks: [
          {
            id: 'task_m1',
            title: 'Analyze survey responses',
            assigneeId: 'mem_sana',
            assignee: 'Sana',
            status: 1,
            due: addDaysYYYYMMDD(6),
          },
        ],
        msgs: [
          {
            id: 'msg_m1',
            author: 'Taskbot',
            text: 'Marketing Case Study room ready. Invite code: MKT-204. Dev is the room Leader and Sana is Moderator.',
            time: '11:00',
            isBot: true,
          },
        ],
        fb: {},
      },
    ],
  };
}
