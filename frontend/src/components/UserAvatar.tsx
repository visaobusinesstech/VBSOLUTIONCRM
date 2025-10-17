import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

interface UserAvatarProps {
  userId?: string;
  userName?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  showTooltip?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  userName,
  avatarUrl,
  size = 'md',
  className = '',
  showName = false,
  showTooltip = true
}) => {
  const [profileData, setProfileData] = useState<{
    name: string;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Buscar dados do perfil se userId for fornecido
  useEffect(() => {
    if (userId && !avatarUrl) {
      fetchProfile();
    }
  }, [userId, avatarUrl]);

  const fetchProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfileData(data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Determinar nome e avatar a serem exibidos
  const displayName = userName || profileData?.name || 'Usuário';
  const displayAvatar = avatarUrl || profileData?.avatar_url;

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(displayName);

  // Gerar cor baseada no nome
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarColor = getColorFromName(displayName);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`relative flex-shrink-0 rounded-full overflow-hidden ${sizeClasses[size]} ${
          showTooltip ? 'group' : ''
        }`}
        title={showTooltip ? displayName : undefined}
      >
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Se a imagem falhar ao carregar, exibir iniciais
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${avatarColor} text-white font-medium`}
          >
            {loading ? (
              <div className="animate-pulse">...</div>
            ) : initials.length > 0 ? (
              initials
            ) : (
              <User className="w-1/2 h-1/2" />
            )}
          </div>
        )}

        {/* Tooltip on hover */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {displayName}
          </div>
        )}
      </div>

      {showName && (
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700 truncate block">
            {displayName}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;

