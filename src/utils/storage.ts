import { AppState, AvailabilityStatus, MemberRole } from '../types';

const STORAGE_KEY = 'splitup_workspace_v2';

export function todayYYYYMMDD(): string {
  const d = new Date();
  return toYYYYMMDD(d);
}

export function toYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysYYYYMMDD(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toYYYYMMDD(d);
}

export function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function nowTimeLabel(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return '?';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function generateInviteCode(projectName: string, existingCodes: string[]): string {
  const letters = projectName
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 4);
  const prefix = letters.length >= 2 ? letters : 'TEAM';
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(100 + Math.random() * 900);
    const code = `${prefix}-${num}`;
    if (!existingCodes.includes(code)) return code;
  }
  return `${prefix}-${Date.now().toString().slice(-3)}`;
}

export function loadStoredState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.teams) || !parsed.profile) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Gracefully ignore storage quota or private browsing blocks
  }
}

export function clearStoredState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function roleLabel(role: MemberRole): string {
  switch (role) {
    case 'leader':
      return 'Leader';
    case 'moderator':
      return 'Moderator';
    case 'member':
      return 'Member';
  }
}

export function statusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case 'online':
      return 'Online';
    case 'studying':
      return 'Studying';
    case 'focus':
      return 'Deep Focus';
    case 'away':
      return 'Away';
  }
}

export function statusColorHex(status: AvailabilityStatus): string {
  switch (status) {
    case 'online':
      return '#23a55a';
    case 'studying':
      return '#f0b232';
    case 'focus':
      return '#5865f2';
    case 'away':
      return '#747f8d';
  }
}

export function compressAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable.'));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
