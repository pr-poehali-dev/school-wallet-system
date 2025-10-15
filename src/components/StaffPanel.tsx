import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/lib/storage';

interface StaffPanelProps {
  onLogout: () => void;
}

export default function StaffPanel({ onLogout }: StaffPanelProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const deposits = storage.getDepositRequests().filter(req => req.status === 'pending');
    const withdrawals = storage.getWithdrawalRequests().filter(req => req.status === 'pending');
    setDepositRequests(deposits);
    setWithdrawalRequests(withdrawals);
  };

  const mockUsers = [
    { id: 1, name: 'Иванов Иван Иванович', balance: 0 },
    { id: 2, name: 'Петрова Мария Сергеевна', balance: 0 },
    { id: 3, name: 'Сидоров Алексей Петрович', balance: 0 },
  ];

  const handleDeposit = () => {
    if (!selectedUser || !depositAmount) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пользователя и введите сумму',
        variant: 'destructive',
      });
      return;
    }

    const user = mockUsers.find((u) => u.id.toString() === selectedUser);
    toast({
      title: 'Баланс пополнен',
      description: `Пользователю ${user?.name} начислено ₽${depositAmount}`,
    });
    setSelectedUser('');
    setDepositAmount('');
  };

  const handleApproveDeposit = (requestId: number) => {
    storage.updateDepositRequestStatus(requestId, 'approved');
    toast({
      title: 'Заявка одобрена',
      description: 'Заявка на пополнение одобрена',
    });
    loadRequests();
  };

  const handleRejectDeposit = (requestId: number) => {
    storage.updateDepositRequestStatus(requestId, 'rejected');
    toast({
      title: 'Заявка отклонена',
      description: 'Заявка на пополнение отклонена',
      variant: 'destructive',
    });
    loadRequests();
  };

  const handleApproveWithdrawal = (requestId: number) => {
    storage.updateWithdrawalRequestStatus(requestId, 'approved');
    toast({
      title: 'Заявка одобрена',
      description: 'Заявка на вывод одобрена',
    });
    loadRequests();
  };

  const handleRejectWithdrawal = (requestId: number) => {
    storage.updateWithdrawalRequestStatus(requestId, 'rejected');
    toast({
      title: 'Заявка отклонена',
      description: 'Заявка на вывод отклонена',
      variant: 'destructive',
    });
    loadRequests();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                <Icon name="Shield" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ПАНЕЛЬ ПЕРСОНАЛА
                </h1>
                <p className="text-sm text-muted-foreground">Администратор</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onLogout}>
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="deposits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-lg p-1">
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <Icon name="ArrowUp" size={18} />
              Пополнения ({depositRequests.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <Icon name="ArrowDown" size={18} />
              Выводы ({withdrawalRequests.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Icon name="Users" size={18} />
              Пользователи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Заявки на пополнение
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {depositRequests.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold text-muted-foreground mb-2">
                        Нет активных заявок
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Все заявки обработаны
                      </p>
                    </div>
                  ) : (
                    depositRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{request.userName}</p>
                            <p className="text-sm text-muted-foreground">{request.date}</p>
                          </div>
                          <p className="font-bold text-xl text-accent">₽{request.amount}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveDeposit(request.id)}
                            className="flex-1 bg-accent hover:bg-accent/90"
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
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Заявки на вывод
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdrawalRequests.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold text-muted-foreground mb-2">
                        Нет активных заявок
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Все заявки обработаны
                      </p>
                    </div>
                  ) : (
                    withdrawalRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{request.userName}</p>
                            <p className="text-sm text-muted-foreground">{request.date}</p>
                          </div>
                          <p className="font-bold text-xl text-primary">₽{request.amount}</p>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <Icon name="AlertCircle" size={16} className="text-primary mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            После одобрения выдайте наличные пользователю в школе
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveWithdrawal(request.id)}
                            className="flex-1 bg-gradient-to-r from-primary to-secondary"
                          >
                            <Icon name="Check" size={18} className="mr-2" />
                            Одобрить
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
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="UserPlus" size={20} />
                  Пополнить баланс пользователя
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userSelect">Выберите пользователя</Label>
                  <select
                    id="userSelect"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full h-12 px-3 rounded-lg border bg-background"
                  >
                    <option value="">-- Выберите пользователя --</option>
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} (Баланс: ₽{user.balance})
                      </option>
                    ))}
                  </select>
                </div>
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
                  onClick={handleDeposit}
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Icon name="Plus" size={20} className="mr-2" />
                  Пополнить баланс
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={20} />
                  Все пользователи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon name="User" size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">PIN: ••••</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₽{user.balance}</p>
                        <Badge variant="secondary">Активен</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
