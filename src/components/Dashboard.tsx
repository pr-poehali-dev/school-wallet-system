import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface DashboardProps {
  user: any;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const balance = typeof user?.balance === 'number' ? user.balance : 0;
  const [stats, setStats] = useState<any>({ lastVisit: null, casinoWins: 0, totalTransactions: 0 });

  useEffect(() => {
    if (user?.id) {
      api.getUserStats(user.id).then(setStats).catch(console.error);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary to-secondary text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80">Баланс счёта</span>
            <Icon name="Wallet" size={24} className="text-white/80" />
          </div>
          <div className="text-5xl font-bold mb-4">₽{balance.toFixed(2)}</div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => onNavigate('requests')}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Пополнить
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => onNavigate('requests')}
            >
              <Icon name="Minus" size={18} className="mr-2" />
              Вывести
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="Clock" size={20} className="text-accent" />
              Последнее посещение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.lastVisit ? new Date(stats.lastVisit).toLocaleString('ru-RU') : 'Никогда'}
            </div>
            <p className="text-sm text-muted-foreground">Время входа</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="Dices" size={20} className="text-secondary" />
              Выигрыши в казино
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₽{stats.casinoWins || 0}</div>
            <p className="text-sm text-muted-foreground">За всё время</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              Всего транзакций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions || 0}</div>
            <p className="text-sm text-muted-foreground">Всего</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => onNavigate('requests')}
          >
            <Icon name="ArrowUp" size={24} />
            <span>Запросить пополнение</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => onNavigate('requests')}
          >
            <Icon name="ArrowDown" size={24} />
            <span>Запросить вывод</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => onNavigate('casino')}
          >
            <Icon name="Dices" size={24} />
            <span>Играть в казино</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => onNavigate('history')}
          >
            <Icon name="History" size={24} />
            <span>История операций</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}