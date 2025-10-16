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
    const interval = setInterval(loadRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = () => {
    const deposits = storage.getDepositRequests();
    const withdrawals = storage.getWithdrawalRequests();
    setDepositRequests(deposits);
    setWithdrawalRequests(withdrawals);
  };

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = () => {
    const allUsers = storage.getUsers();
    const usersWithBalances = allUsers.map((u: any) => ({
      ...u,
      balance: storage.getUserBalance(u.fullName)
    }));
    setUsers(usersWithBalances);
  };

  const handleDeposit = () => {
    if (!selectedUser || !depositAmount) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пользователя и введите сумму',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseInt(depositAmount);
    storage.updateUserBalance(selectedUser, amount);
    
    storage.addTransaction(selectedUser, {
      type: 'staff_add',
      amount: amount,
      description: 'Начисление от персонала',
      timestamp: new Date().toISOString()
    });

    toast({
      title: 'Баланс пополнен',
      description: `Пользователю ${selectedUser} начислено ${amount} 💎`,
    });
    setSelectedUser('');
    setDepositAmount('');
    loadUsers();
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
                        className={`p-4 rounded-lg border space-y-3 ${
                          request.status === 'pending' 
                            ? 'bg-card' 
                            : request.status === 'approved' 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{request.userName}</p>
                            <p className="text-sm text-muted-foreground">{request.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-accent">₽{request.amount}</p>
                            {request.status !== 'pending' && (
                              <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                                {request.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
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
                        )}
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
                        className={`p-4 rounded-lg border space-y-3 ${
                          request.status === 'pending' 
                            ? 'bg-card' 
                            : request.status === 'approved' 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{request.userName}</p>
                            <p className="text-sm text-muted-foreground">{request.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-primary">₽{request.amount}</p>
                            {request.status !== 'pending' && (
                              <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                                {request.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <>
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
                          </>
                        )}
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
                    {users.map((user) => (
                      <option key={user.fullName} value={user.fullName}>
                        {user.fullName} (Баланс: {user.balance} 💎)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Сумма пополнения (💎)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    placeholder="100"
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
                  Все пользователи ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold text-muted-foreground">
                        Нет зарегистрированных пользователей
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.fullName}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon name="User" size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">PIN: ••••</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{user.balance} 💎</p>
                          <Badge variant="secondary">Активен</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}