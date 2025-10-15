import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Dashboard from '@/components/Dashboard';
import Casino from '@/components/Casino';
import Requests from '@/components/Requests';
import History from '@/components/History';
import StaffPanel from '@/components/StaffPanel';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [fullName, setFullName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!fullName || !pinCode) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (pinCode.length !== 4) {
      alert('PIN-код должен содержать 4 цифры');
      return;
    }

    setUser({ fullName, balance: 0 });
    setIsAuthenticated(true);
  };

  const handleStaffLogin = async () => {
    if (fullName === 'admin' && pinCode === 'admin123') {
      setIsStaffMode(true);
      setIsAuthenticated(true);
    } else {
      alert('Неверные данные персонала');
    }
  };

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

          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Icon name="User" size={16} />
                Клиент
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <Icon name="Shield" size={16} />
                Персонал
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client">
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
                    onClick={() => {
                      setIsRegistering(false);
                      handleAuth();
                    }}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  >
                    Войти
                  </Button>
                  <Button
                    onClick={() => {
                      setIsRegistering(true);
                      handleAuth();
                    }}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    Регистрация
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffLogin">Логин</Label>
                  <Input
                    id="staffLogin"
                    placeholder="admin"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffPassword">Пароль</Label>
                  <Input
                    id="staffPassword"
                    type="password"
                    placeholder="••••••••"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button
                  onClick={handleStaffLogin}
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  <Icon name="Shield" size={20} className="mr-2" />
                  Войти в панель персонала
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  if (isStaffMode) {
    return <StaffPanel onLogout={() => {
      setIsAuthenticated(false);
      setIsStaffMode(false);
      setFullName('');
      setPinCode('');
    }} />;
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-white/80 backdrop-blur-lg p-1 h-auto">
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-3">
              <Icon name="LayoutDashboard" size={20} />
              <span className="text-xs">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="casino" className="flex flex-col gap-1 py-3">
              <Icon name="Dices" size={20} />
              <span className="text-xs">Казино</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex flex-col gap-1 py-3">
              <Icon name="ArrowDownUp" size={20} />
              <span className="text-xs">Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col gap-1 py-3">
              <Icon name="History" size={20} />
              <span className="text-xs">История</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 animate-fade-in">
            <Dashboard user={user} />
          </TabsContent>

          <TabsContent value="casino" className="mt-6 animate-fade-in">
            <Casino user={user} />
          </TabsContent>

          <TabsContent value="requests" className="mt-6 animate-fade-in">
            <Requests user={user} />
          </TabsContent>

          <TabsContent value="history" className="mt-6 animate-fade-in">
            <History user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}