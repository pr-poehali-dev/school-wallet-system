import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { userStorage } from '@/lib/userStorage';

interface RouletteGameProps {
  user: {
    fullName: string;
    pinCode: string;
    balance: number;
  };
}

export default function RouletteGame({ user }: RouletteGameProps) {
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  const [message, setMessage] = useState('');

  const spinRoulette = async () => {
    const amount = parseInt(betAmount);
    
    if (!betAmount || amount <= 0) {
      setMessage('Введите корректную сумму ставки');
      return;
    }

    if (amount > user.balance) {
      setMessage('Недостаточно средств');
      return;
    }

    userStorage.updateBalance(user.fullName, -amount);
    
    setIsSpinning(true);
    setResult(null);
    setMessage('');

    setTimeout(() => {
      const isWin = Math.random() > 0.5;
      setResult(isWin ? 'win' : 'loss');
      setIsSpinning(false);

      if (isWin) {
        userStorage.updateBalance(user.fullName, amount * 2);
        setMessage(`🎉 Победа! Вы выиграли ${amount * 2} 💎`);
        
        userStorage.addTransaction(user.fullName, {
          type: 'game',
          amount: amount,
          description: 'Рулетка (Выигрыш)',
          timestamp: new Date().toISOString()
        });
      } else {
        setMessage(`😔 Проигрыш! Вы потеряли ${amount} 💎`);
        
        userStorage.addTransaction(user.fullName, {
          type: 'game',
          amount: -amount,
          description: 'Рулетка (Проигрыш)',
          timestamp: new Date().toISOString()
        });
      }
      setBetAmount('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Dices" size={28} />
            Рулетка казино
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div
              className={`w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ${
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
              <Label htmlFor="betAmount">Сумма ставки</Label>
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

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setBetAmount('10')}
                disabled={isSpinning}
              >
                10 💎
              </Button>
              <Button
                variant="outline"
                onClick={() => setBetAmount('50')}
                disabled={isSpinning}
              >
                50 💎
              </Button>
              <Button
                variant="outline"
                onClick={() => setBetAmount('100')}
                disabled={isSpinning}
              >
                100 💎
              </Button>
              <Button
                variant="outline"
                onClick={() => setBetAmount(user.balance.toString())}
                disabled={isSpinning}
              >
                ВСЁ
              </Button>
            </div>

            <Button
              onClick={spinRoulette}
              disabled={isSpinning}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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

            {message && (
              <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                result === 'win' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-700' 
                  : result === 'loss'
                  ? 'bg-red-500/10 border-red-500/30 text-red-700'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700'
              }`}>
                <Icon name={result === 'win' ? 'Trophy' : 'AlertCircle'} size={24} />
                <span className="font-medium">{message}</span>
              </div>
            )}
          </div>

          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={20} className="text-purple-600 mt-0.5" />
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
    </div>
  );
}
