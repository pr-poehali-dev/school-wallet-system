import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';

interface RequestsProps {
  user: any;
}

export default function Requests({ user }: RequestsProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [userRequests, setUserRequests] = useState<any[]>([]);

  useEffect(() => {
    loadUserRequests();
  }, [user]);

  const loadUserRequests = async () => {
    const deposits = await api.getDepositRequests();
    const withdrawals = await api.getWithdrawalRequests();
    
    const userDeposits = deposits.filter((req: any) => req.userId === user?.id);
    const userWithdrawals = withdrawals.filter((req: any) => req.userId === user?.id);
    
    const combined = [
      ...userDeposits.map((d: any) => ({ ...d, type: 'deposit' })),
      ...userWithdrawals.map((w: any) => ({ ...w, type: 'withdrawal' }))
    ].sort((a, b) => b.id - a.id);
    
    setUserRequests(combined);
  };

  const handleDepositRequest = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    await api.createDepositRequest(user?.id || 0, amount);

    toast({
      title: 'Заявка отправлена',
      description: `Запрос на пополнение ₽${amount.toFixed(2)} отправлен персоналу`,
    });
    setDepositAmount('');
    loadUserRequests();
  };

  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast({
        title: 'Недостаточно средств',
        description: 'У вас недостаточно средств для вывода',
        variant: 'destructive',
      });
      return;
    }

    await api.createWithdrawalRequest(user?.id || 0, amount);

    toast({
      title: 'Заявка отправлена',
      description: 'Заберите средства в школе после одобрения',
    });
    setWithdrawAmount('');
    loadUserRequests();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">Новая заявка</TabsTrigger>
          <TabsTrigger value="history">История заявок</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ArrowUp" size={20} className="text-accent" />
                Запрос на пополнение
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Сумма пополнения (₽)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <Button
                onClick={handleDepositRequest}
                className="w-full h-12 bg-accent hover:bg-accent/90"
              >
                <Icon name="Send" size={20} className="mr-2" />
                Отправить запрос на пополнение
              </Button>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Icon name="Info" size={16} className="text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  После отправки заявки, персонал школы получит уведомление и сможет пополнить ваш счёт
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ArrowDown" size={20} className="text-primary" />
                Запрос на вывод средств
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Сумма вывода (₽)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="200"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  Доступно для вывода:{' '}
                  <span className="font-bold">₽{(user?.balance || 0).toFixed(2)}</span>
                </p>
              </div>
              <Button
                onClick={handleWithdrawRequest}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Icon name="Send" size={20} className="mr-2" />
                Отправить запрос на вывод
              </Button>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Icon name="Info" size={16} className="text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Заберите наличные в школе после одобрения заявки персоналом
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Мои заявки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">
                    Заявок пока нет
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Создайте первую заявку на пополнение или вывод
                  </p>
                </div>
              ) : (
                userRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          request.type === 'deposit' ? 'bg-accent/10' : 'bg-primary/10'
                        }`}
                      >
                        <Icon
                          name={request.type === 'deposit' ? 'ArrowUp' : 'ArrowDown'}
                          size={20}
                          className={request.type === 'deposit' ? 'text-accent' : 'text-primary'}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {request.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold">₽{request.amount}</p>
                        <Badge
                          variant={
                            request.status === 'approved'
                              ? 'default'
                              : request.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {request.status === 'approved'
                            ? 'Одобрено'
                            : request.status === 'pending'
                            ? 'В обработке'
                            : 'Отклонено'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}