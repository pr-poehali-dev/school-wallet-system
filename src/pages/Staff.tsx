import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { storage } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

export default function Staff() {
  const navigate = useNavigate();
  const [depositRequests, setDepositRequests] = useState(storage.getDepositRequests());
  const [withdrawalRequests, setWithdrawalRequests] = useState(storage.getWithdrawalRequests());
  const [selectedUser, setSelectedUser] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('staffAuth');
    if (!isAuth) {
      navigate('/staff-login');
    }

    const interval = setInterval(() => {
      setDepositRequests(storage.getDepositRequests());
      setWithdrawalRequests(storage.getWithdrawalRequests());
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('staffAuth');
    navigate('/staff-login');
  };

  const handleManualDeposit = () => {
    if (!selectedUser || !depositAmount) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Сумма должна быть больше 0',
        variant: 'destructive',
      });
      return;
    }

    storage.updateUserBalance(selectedUser, amount);
    toast({
      title: 'Успешно',
      description: `Начислено ₽${amount} пользователю ${selectedUser}`,
    });
    setSelectedUser('');
    setDepositAmount('');
  };

  const handleApproveDeposit = (id: number) => {
    storage.updateDepositRequestStatus(id, 'approved');
    setDepositRequests(storage.getDepositRequests());
    toast({
      title: 'Заявка одобрена',
      description: 'Средства зачислены на баланс клиента',
    });
  };

  const handleRejectDeposit = (id: number) => {
    storage.updateDepositRequestStatus(id, 'rejected');
    setDepositRequests(storage.getDepositRequests());
    toast({
      title: 'Заявка отклонена',
      variant: 'destructive',
    });
  };

  const handleApproveWithdrawal = (id: number) => {
    storage.updateWithdrawalRequestStatus(id, 'approved');
    setWithdrawalRequests(storage.getWithdrawalRequests());
    toast({
      title: 'Выдача одобрена',
      description: 'Средства списаны с баланса. Выдайте наличные в школе',
    });
  };

  const handleRejectWithdrawal = (id: number) => {
    storage.updateWithdrawalRequestStatus(id, 'rejected');
    setWithdrawalRequests(storage.getWithdrawalRequests());
    toast({
      title: 'Выдача отклонена',
      variant: 'destructive',
    });
  };

  const pendingDeposits = depositRequests.filter(r => r.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon name="ShieldCheck" size={32} />
            Панель персонала
          </h1>
          <Button onClick={handleLogout} variant="outline">
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">
              <Icon name="Plus" size={18} className="mr-2" />
              Начисление
            </TabsTrigger>
            <TabsTrigger value="deposits">
              <Icon name="ArrowDownToLine" size={18} className="mr-2" />
              Пополнения ({pendingDeposits.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <Icon name="ArrowUpFromLine" size={18} className="mr-2" />
              Выводы ({pendingWithdrawals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Начислить платину клиенту</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">ФИО клиента</Label>
                  <Input
                    id="user"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма (₽)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <Button onClick={handleManualDeposit} className="w-full">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Начислить
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Заявки на пополнение</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDeposits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Нет заявок на пополнение</p>
                ) : (
                  <div className="space-y-4">
                    {pendingDeposits.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-lg">{request.userName}</p>
                              <p className="text-sm text-muted-foreground">{request.date}</p>
                            </div>
                            <p className="text-2xl font-bold text-primary">₽{request.amount}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleApproveDeposit(request.id)} 
                              className="flex-1"
                            >
                              <Icon name="Check" size={18} className="mr-2" />
                              Одобрить
                            </Button>
                            <Button 
                              onClick={() => handleRejectDeposit(request.id)} 
                              variant="destructive" 
                              className="flex-1"
                            >
                              <Icon name="X" size={18} className="mr-2" />
                              Отклонить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Заявки на вывод</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingWithdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Нет заявок на вывод</p>
                ) : (
                  <div className="space-y-4">
                    {pendingWithdrawals.map((request) => (
                      <Card key={request.id} className="border-orange-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-lg">{request.userName}</p>
                              <p className="text-sm text-muted-foreground">{request.date}</p>
                              <p className="text-sm text-orange-600 font-medium mt-1">
                                💰 Выдать наличные в школе
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">₽{request.amount}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleApproveWithdrawal(request.id)} 
                              className="flex-1"
                            >
                              <Icon name="Check" size={18} className="mr-2" />
                              Выдано
                            </Button>
                            <Button 
                              onClick={() => handleRejectWithdrawal(request.id)} 
                              variant="destructive" 
                              className="flex-1"
                            >
                              <Icon name="X" size={18} className="mr-2" />
                              Отклонить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
