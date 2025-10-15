import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import RouletteGame from './RouletteGame';
import CrashGame from './CrashGame';

interface CasinoProps {
  user: any;
}

export default function Casino({ user }: CasinoProps) {
  const [activeGame, setActiveGame] = useState('roulette');

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeGame} onValueChange={setActiveGame} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg p-1 h-auto">
          <TabsTrigger value="roulette" className="flex items-center gap-2 py-3">
            <Icon name="Dices" size={20} />
            <span>Рулетка</span>
          </TabsTrigger>
          <TabsTrigger value="crash" className="flex items-center gap-2 py-3">
            <Icon name="Plane" size={20} />
            <span>Crash</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roulette" className="animate-fade-in">
          <RouletteGame user={user} />
        </TabsContent>

        <TabsContent value="crash" className="animate-fade-in">
          <CrashGame user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}