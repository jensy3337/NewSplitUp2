import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { AvailabilityStatus } from '../types';
import { getInitials, statusColorHex } from '../utils/storage';

interface AvatarProps {
  name: string;
  color?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: AvailabilityStatus;
  isBot?: boolean;
  showStatusDot?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 text-xl',
};

const DOT_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-2',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-[3px]',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color = '#5865f2',
  avatarUrl,
  size = 'md',
  status = 'online',
  isBot = false,
  showStatusDot = false,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (isBot) {
    return (
      <div
        className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center shrink-0 text-white font-semibold`}
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      >
        <Bot className="w-4 h-4" />
      </div>
    );
  }

  const showImage = Boolean(avatarUrl) && !imgFailed;

  return (
    <div className={`relative inline-flex shrink-0 ${SIZE_CLASSES[size]}`}>
      {showImage ? (
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full rounded-full object-cover bg-[var(--card-bg)]"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold select-none tracking-tight"
          style={{ backgroundColor: color }}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatusDot && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-[var(--sidebar-bg)] ${DOT_CLASSES[size]}`}
          style={{ backgroundColor: statusColorHex(status) }}
          title={status}
        />
      )}
    </div>
  );
};
