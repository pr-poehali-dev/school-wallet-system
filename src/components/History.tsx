import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface HistoryProps {
  user: any;
}

export default function History({ user }: HistoryProps) {
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
          <div className="py-12 text-center">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">
              История пуста
            </p>
            <p className="text-sm text-muted-foreground">
              Здесь будут отображаться все ваши транзакции
            </p>
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
              <div className="text-2xl font-bold text-muted-foreground">₽0</div>
              <div className="text-sm text-muted-foreground">Пополнено</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <Icon name="Minus" size={24} className="mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold text-muted-foreground">₽0</div>
              <div className="text-sm text-muted-foreground">Выведено</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Icon name="Trophy" size={24} className="mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-muted-foreground">₽0</div>
              <div className="text-sm text-muted-foreground">Выигрыши</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/10">
              <Icon name="Activity" size={24} className="mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-muted-foreground">0</div>
              <div className="text-sm text-muted-foreground">Операций</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
