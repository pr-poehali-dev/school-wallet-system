import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';

interface CrashGameProps {
  user: {
    id: number;
    fullName: string;
    pinCode: string;
    balance: number;
  };
}

export default function CrashGame({ user }: CrashGameProps) {
  const [betAmount, setBetAmount] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [message, setMessage] = useState('');
  const [planePosition, setPlanePosition] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startGame = async () => {
    const bet = parseInt(betAmount);
    
    if (!betAmount || bet <= 0) {
      setMessage('Введите сумму ставки');
      return;
    }

    if (bet > user.balance) {
      setMessage('Недостаточно средств');
      return;
    }

    await api.updateBalance(user.id, -bet);
    
    const willCrash = Math.random() < 0.5;
    const crash = willCrash ? Math.random() * 1.5 + 0.5 : Math.random() * 0.5 + 2.0;
    setCrashPoint(crash);
    
    setIsPlaying(true);
    setResult(null);
    setMessage('');
    setMultiplier(1.00);
    setPlanePosition(0);

    let currentMultiplier = 1.00;
    let currentPosition = 0;
    
    intervalRef.current = setInterval(() => {
      currentMultiplier += 0.05;
      currentPosition += 2;
      
      setMultiplier(currentMultiplier);
      setPlanePosition(currentPosition);

      if (currentMultiplier >= crash) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsPlaying(false);
        setResult('lose');
        setMessage(`💥 Крах на ${crash.toFixed(2)}x! Вы потеряли ${bet} 💎`);
        

      }
    }, 100);
  };

  const cashOut = async () => {
    if (!isPlaying || !betAmount) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const bet = parseInt(betAmount);
    const winAmount = Math.floor(bet * multiplier);
    
    await api.updateBalance(user.id, winAmount);
    
    setIsPlaying(false);
    setResult('win');
    setMessage(`🎉 Успешный выход на ${multiplier.toFixed(2)}x! Вы выиграли ${winAmount} 💎`);
  };

  const resetGame = () => {
    setResult(null);
    setMessage('');
    setMultiplier(1.00);
    setPlanePosition(0);
    setBetAmount('');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Plane" size={24} />
            Crash - Самолет
          </CardTitle>
          <CardDescription>
            Самолет взлетает! Остановитесь вовремя, чтобы забрать выигрыш. Шанс 50/50.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative h-64 bg-gradient-to-t from-blue-100 to-sky-200 rounded-xl overflow-hidden border-2 border-blue-300">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-600/30 border-t-2 border-green-700/50" />
            
            <div 
              className="absolute transition-all duration-100 text-4xl"
              style={{ 
                bottom: `${Math.min(planePosition, 220)}px`,
                left: `${Math.min(planePosition * 1.5, 85)}%`,
                transform: `rotate(${Math.min(planePosition / 3, 45)}deg)`,
                opacity: result === 'lose' ? 0 : 1
              }}
            >
              ✈️
            </div>

            {result === 'lose' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-bounce">💥</div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg font-bold text-2xl">
              {multiplier.toFixed(2)}x
            </div>

            {isPlaying && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
                В ПОЛЕТЕ
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="betAmount">Сумма ставки</Label>
              <Input
                id="betAmount"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Введите сумму"
                disabled={isPlaying}
                min="1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setBetAmount('10')}
                variant="outline"
                size="sm"
                disabled={isPlaying}
                className="flex-1"
              >
                10 💎
              </Button>
              <Button
                onClick={() => setBetAmount('50')}
                variant="outline"
                size="sm"
                disabled={isPlaying}
                className="flex-1"
              >
                50 💎
              </Button>
              <Button
                onClick={() => setBetAmount('100')}
                variant="outline"
                size="sm"
                disabled={isPlaying}
                className="flex-1"
              >
                100 💎
              </Button>
              <Button
                onClick={() => setBetAmount(user.balance.toString())}
                variant="outline"
                size="sm"
                disabled={isPlaying}
                className="flex-1"
              >
                ВСЁ
              </Button>
            </div>

            {!isPlaying && result === null && (
              <Button
                onClick={startGame}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={!betAmount}
              >
                <Icon name="Plane" size={24} />
                Взлететь
              </Button>
            )}

            {isPlaying && (
              <Button
                onClick={cashOut}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 animate-pulse"
              >
                <Icon name="CircleDollarSign" size={24} />
                Забрать {Math.floor(parseInt(betAmount) * multiplier)} 💎
              </Button>
            )}

            {result !== null && (
              <Button
                onClick={resetGame}
                className="w-full h-14 text-lg font-bold"
                variant="outline"
              >
                <Icon name="RotateCcw" size={24} />
                Играть снова
              </Button>
            )}

            {message && (
              <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                result === 'win' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-700' 
                  : result === 'lose'
                  ? 'bg-red-500/10 border-red-500/30 text-red-700'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700'
              }`}>
                <Icon name={result === 'win' ? 'Trophy' : result === 'lose' ? 'Flame' : 'AlertCircle'} size={24} />
                <span className="font-medium">{message}</span>
              </div>
            )}
          </div>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Info" size={20} />
                Правила игры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>🎯 Сделайте ставку и запустите самолет</p>
              <p>📈 Множитель растет по мере полета</p>
              <p>⚡ Нажмите "Забрать" до краха, чтобы выиграть</p>
              <p>💥 Если самолет упадет - вы потеряете ставку</p>
              <p>🎲 Шанс 50/50 - самолет может упасть в любой момент</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}