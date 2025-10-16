import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';

interface LeaderboardProps {
  currentUser?: {
    fullName: string;
  };
}

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadLeaderboard = async () => {
    const allUsers = await api.getUsers();
    
    const sorted = allUsers
      .sort((a: any, b: any) => b.balance - a.balance)
      .slice(0, 10);
    
    setTopUsers(sorted);

    if (currentUser) {
      const allSorted = allUsers.sort((a: any, b: any) => b.balance - a.balance);
      const rank = allSorted.findIndex((u: any) => u.fullName === currentUser.fullName);
      setCurrentUserRank(rank >= 0 ? rank + 1 : null);
    }
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}.`;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40';
      case 2: return 'from-gray-400/20 to-slate-400/20 border-gray-400/40';
      case 3: return 'from-orange-700/20 to-amber-700/20 border-orange-700/40';
      default: return 'from-blue-500/10 to-purple-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Trophy" size={28} className="text-yellow-600" />
            Таблица лидеров
          </CardTitle>
          <CardDescription>
            Топ-10 самых богатых игроков
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topUsers.length === 0 ? (
            <div className="py-12 text-center">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold text-muted-foreground mb-2">
                Нет игроков
              </p>
              <p className="text-sm text-muted-foreground">
                Станьте первым в таблице лидеров!
              </p>
            </div>
          ) : (
            topUsers.map((user, index) => {
              const position = index + 1;
              const isCurrentUser = currentUser?.fullName === user.fullName;
              
              return (
                <div
                  key={user.fullName}
                  className={`p-4 rounded-xl border-2 bg-gradient-to-r transition-all ${
                    isCurrentUser 
                      ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                      : ''
                  } ${getRankColor(position)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold w-12 text-center">
                        {getMedalEmoji(position)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold ${position <= 3 ? 'text-lg' : 'text-base'}`}>
                            {user.fullName}
                          </p>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-semibold">
                              ВЫ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Место #{position}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${position <= 3 ? 'text-2xl' : 'text-xl'}`}>
                        {user.balance} 💎
                      </p>
                      {position === 1 && (
                        <p className="text-xs text-yellow-600 font-semibold">
                          ЧЕМПИОН
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {currentUserRank && currentUserRank > 10 && (
            <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Ваше текущее место
                </p>
                <p className="text-2xl font-bold text-primary">
                  #{currentUserRank}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Продолжайте играть, чтобы попасть в топ-10!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Как попасть в топ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Icon name="Dices" size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Играйте в казино</p>
              <p>Выигрывайте в рулетке и Crash, чтобы увеличить баланс</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="ArrowUp" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Пополняйте счёт</p>
              <p>Создавайте заявки на пополнение через персонал</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="TrendingUp" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Рискуйте с умом</p>
              <p>Чем больше баланс — тем выше позиция в таблице</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}