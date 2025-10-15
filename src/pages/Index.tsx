import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import Dashboard from '@/components/Dashboard';
import Casino from '@/components/Casino';
import Requests from '@/components/Requests';
import Profile from '@/components/Profile';
import Leaderboard from '@/components/Leaderboard';
import { storage } from '@/lib/storage';
import { userStorage } from '@/lib/userStorage';

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [fullName, setFullName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = () => {
    if (!fullName || !pinCode) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (pinCode.length !== 4) {
      alert('PIN-код должен содержать 4 цифры');
      return;
    }

    const existingUser = userStorage.getUser(fullName, pinCode);
    if (!existingUser) {
      alert('Неверное ФИО или PIN-код');
      return;
    }

    const balance = userStorage.getUserBalance(fullName);
    setUser({ fullName, pinCode, balance });
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    if (!fullName || !pinCode) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (pinCode.length !== 4) {
      alert('PIN-код должен содержать 4 цифры');
      return;
    }

    userStorage.registerUser(fullName, pinCode);
    const balance = userStorage.getUserBalance(fullName);
    setUser({ fullName, pinCode, balance });
    setIsAuthenticated(true);
  };

  const handleProfileUpdate = (newFullName: string, newPinCode: string) => {
    setUser({ fullName: newFullName, pinCode: newPinCode, balance: userStorage.getUserBalance(newFullName) });
  };

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        const balance = userStorage.getUserBalance(user.fullName);
        setUser((prev: any) => ({ ...prev, balance }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 backdrop-blur-lg bg-white/95 shadow-2xl animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4">
              <Icon name="Wallet" size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              ZOV BANK
            </h1>
            <p className="text-muted-foreground">Зовская платёжная система</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                placeholder="Иванов Иван Иванович"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pinCode">PIN-код (4 цифры)</Label>
              <Input
                id="pinCode"
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleLogin}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                Войти
              </Button>
              <Button
                onClick={handleRegister}
                variant="outline"
                className="flex-1 h-12"
              >
                Регистрация
              </Button>
            </div>
            <Button
              onClick={() => navigate('/staff-login')}
              variant="ghost"
              className="w-full"
            >
              <Icon name="Shield" size={18} className="mr-2" />
              Вход для персонала
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                <Icon name="Wallet" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ZOV BANK
                </h1>
                <p className="text-sm text-muted-foreground">{user?.fullName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAuthenticated(false);
                setUser(null);
                setFullName('');
                setPinCode('');
              }}
            >
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 bg-white/80 backdrop-blur-lg p-1 h-auto">
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-3">
              <Icon name="LayoutDashboard" size={20} />
              <span className="text-xs">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="casino" className="flex flex-col gap-1 py-3">
              <Icon name="Dices" size={20} />
              <span className="text-xs">Казино</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex flex-col gap-1 py-3">
              <Icon name="Trophy" size={20} />
              <span className="text-xs">Рейтинг</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex flex-col gap-1 py-3">
              <Icon name="ArrowDownUp" size={20} />
              <span className="text-xs">Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-1 py-3">
              <Icon name="User" size={20} />
              <span className="text-xs">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 animate-fade-in">
            <Dashboard user={user} onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="casino" className="mt-6 animate-fade-in">
            <Casino user={user} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6 animate-fade-in">
            <Leaderboard currentUser={user} />
          </TabsContent>

          <TabsContent value="requests" className="mt-6 animate-fade-in">
            <Requests user={user} />
          </TabsContent>

          <TabsContent value="profile" className="mt-6 animate-fade-in">
            <Profile user={user} onUpdate={handleProfileUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}