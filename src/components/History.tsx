import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface HistoryProps {
  user: any;
}

export default function History({ user }: HistoryProps) {
  const mockTransactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 500,
      date: '2025-10-13 14:30',
      status: 'completed',
    },
    {
      id: 2,
      type: 'casino_win',
      amount: 200,
      date: '2025-10-13 12:15',
      status: 'completed',
    },
    {
      id: 3,
      type: 'casino_loss',
      amount: -100,
      date: '2025-10-13 12:10',
      status: 'completed',
    },
    {
      id: 4,
      type: 'withdrawal',
      amount: -300,
      date: '2025-10-12 16:45',
      status: 'completed',
    },
    {
      id: 5,
      type: 'deposit',
      amount: 1000,
      date: '2025-10-10 10:00',
      status: 'completed',
    },
    {
      id: 6,
      type: 'casino_win',
      amount: 150,
      date: '2025-10-09 15:20',
      status: 'completed',
    },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return { name: 'ArrowUp', color: 'text-accent' };
      case 'withdrawal':
        return { name: 'ArrowDown', color: 'text-primary' };
      case 'casino_win':
        return { name: 'TrendingUp', color: 'text-accent' };
      case 'casino_loss':
        return { name: 'TrendingDown', color: 'text-destructive' };
      default:
        return { name: 'DollarSign', color: 'text-muted-foreground' };
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'withdrawal':
        return 'Вывод средств';
      case 'casino_win':
        return 'Выигрыш в казино';
      case 'casino_loss':
        return 'Проигрыш в казино';
      default:
        return 'Операция';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={24} />
            История операций
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTransactions.map((transaction) => {
              const icon = getTransactionIcon(transaction.type);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.amount > 0 ? 'bg-accent/10' : 'bg-destructive/10'
                      }`}
                    >
                      <Icon name={icon.name as any} size={20} className={icon.color} />
                    </div>
                    <div>
                      <p className="font-semibold">{getTransactionLabel(transaction.type)}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        transaction.amount > 0 ? 'text-accent' : 'text-destructive'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}₽{Math.abs(transaction.amount)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status === 'completed' ? 'Завершено' : 'В обработке'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="PieChart" size={20} />
            Статистика за месяц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-accent/10">
              <Icon name="Plus" size={24} className="mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-accent">₽1,500</div>
              <div className="text-sm text-muted-foreground">Пополнено</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <Icon name="Minus" size={24} className="mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold text-destructive">₽300</div>
              <div className="text-sm text-muted-foreground">Выведено</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Icon name="Trophy" size={24} className="mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">₽350</div>
              <div className="text-sm text-muted-foreground">Выигрыши</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/10">
              <Icon name="Activity" size={24} className="mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-secondary">42</div>
              <div className="text-sm text-muted-foreground">Операций</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
