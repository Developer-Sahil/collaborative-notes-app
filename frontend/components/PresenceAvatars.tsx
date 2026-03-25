"use client";

interface AwarenessUser {
  clientId: number;
  name: string;
  color: string;
}

interface PresenceAvatarsProps {
  users: AwarenessUser[];
}

export function PresenceAvatars({ users }: PresenceAvatarsProps) {
  if (users.length === 0) return null;

  const MAX_VISIBLE = 4;
  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visible.map((u) => (
          <div
            key={u.clientId}
            title={u.name}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white shadow-sm transition-transform hover:scale-110 hover:z-10"
            style={{ backgroundColor: u.color }}
          >
            {u.name.slice(0, 2).toUpperCase()}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-400 font-medium hidden sm:block">
        {users.length === 1 ? "1 person" : `${users.length} people`} editing
      </span>
    </div>
  );
}
