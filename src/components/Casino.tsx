import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/lib/storage';

interface CasinoProps {
  user: any;
}

export default function Casino({ user }: CasinoProps) {
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);

  const spinRoulette = async () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму ставки',
        variant: 'destructive',
      });
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast({
        title: 'Недостаточно средств',
        description: 'У вас недостаточно средств для этой ставки',
        variant: 'destructive',
      });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      const isWin = Math.random() > 0.5;
      setResult(isWin ? 'win' : 'loss');
      setIsSpinning(false);

      if (isWin) {
        storage.updateUserBalance(user?.fullName, amount * 2);
        toast({
          title: '🎉 Победа!',
          description: `Вы выиграли ₽${(amount * 2).toFixed(2)}!`,
        });
      } else {
        storage.updateUserBalance(user?.fullName, -amount);
        toast({
          title: '😔 Проигрыш',
          description: `Вы проиграли ₽${amount.toFixed(2)}`,
          variant: 'destructive',
        });
      }
      setBetAmount('');
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Dices" size={28} />
            Рулетка казино
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div
              className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl ${
                isSpinning ? 'animate-spin-slow' : ''
              }`}
            >
              <div className="text-6xl">
                {isSpinning ? '🎰' : result === 'win' ? '🎉' : result === 'loss' ? '😔' : '🎲'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="betAmount">Сумма ставки (₽)</Label>
              <Input
                id="betAmount"
                type="number"
                placeholder="100"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isSpinning}
                className="h-12 text-lg"
              />
            </div>

            <Button
              onClick={spinRoulette}
              disabled={isSpinning}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              {isSpinning ? (
                <>
                  <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                  Крутим рулетку...
                </>
              ) : (
                <>
                  <Icon name="Play" size={24} className="mr-2" />
                  Крутить рулетку
                </>
              )}
            </Button>

            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 500].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setBetAmount(amount.toString())}
                  disabled={isSpinning}
                >
                  ₽{amount}
                </Button>
              ))}
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={20} className="text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Правила игры:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Победа: ваша ставка удваивается (x2)</li>
                    <li>Проигрыш: ставка списывается с баланса</li>
                    <li>Шанс выигрыша: 50%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Статистика игр
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-accent/10">
              <div className="text-3xl font-bold text-accent">15</div>
              <div className="text-sm text-muted-foreground">Побед</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <div className="text-3xl font-bold text-destructive">12</div>
              <div className="text-sm text-muted-foreground">Поражений</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}