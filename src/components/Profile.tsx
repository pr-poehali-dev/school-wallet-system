import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { storage } from '@/lib/storage';

interface ProfileProps {
  user: {
    fullName: string;
    pinCode: string;
    balance: number;
  };
  onUpdate: (newFullName: string, newPinCode: string) => void;
}

export default function Profile({ user, onUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newFullName, setNewFullName] = useState(user.fullName);
  const [newPinCode, setNewPinCode] = useState(user.pinCode);
  const [confirmPinCode, setConfirmPinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    setError('');
    setSuccess('');

    if (!newFullName.trim()) {
      setError('Введите ФИО');
      return;
    }

    if (newPinCode.length !== 4 || !/^\d+$/.test(newPinCode)) {
      setError('PIN-код должен состоять из 4 цифр');
      return;
    }

    if (newPinCode !== confirmPinCode) {
      setError('PIN-коды не совпадают');
      return;
    }

    const oldUser = storage.getUser(user.fullName, user.pinCode);
    if (!oldUser) {
      setError('Ошибка: пользователь не найден');
      return;
    }

    if (newFullName !== user.fullName) {
      const existingUser = storage.getUser(newFullName, newPinCode);
      if (existingUser) {
        setError('Пользователь с таким ФИО уже существует');
        return;
      }
    }

    storage.updateUser(user.fullName, user.pinCode, newFullName, newPinCode);
    onUpdate(newFullName, newPinCode);
    setSuccess('Данные успешно обновлены!');
    setIsEditing(false);
    setConfirmPinCode('');
  };

  const handleCancel = () => {
    setNewFullName(user.fullName);
    setNewPinCode(user.pinCode);
    setConfirmPinCode('');
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={24} />
            Личный кабинет
          </CardTitle>
          <CardDescription>Управление профилем и настройками безопасности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Введите новое ФИО"
                />
              ) : (
                <div className="p-3 bg-white/50 rounded-lg border">
                  {user.fullName}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Баланс</Label>
              <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-lg border border-yellow-500/30 flex items-center gap-2">
                <Icon name="Coins" size={20} className="text-yellow-600" />
                <span className="font-bold text-lg">{user.balance} 💎</span>
              </div>
            </div>

            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPinCode">Новый PIN-код</Label>
                  <Input
                    id="newPinCode"
                    type="password"
                    value={newPinCode}
                    onChange={(e) => setNewPinCode(e.target.value)}
                    placeholder="4 цифры"
                    maxLength={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPinCode">Подтвердите PIN-код</Label>
                  <Input
                    id="confirmPinCode"
                    type="password"
                    value={confirmPinCode}
                    onChange={(e) => setConfirmPinCode(e.target.value)}
                    placeholder="Повторите PIN-код"
                    maxLength={4}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-700">
                <Icon name="AlertCircle" size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-700">
                <Icon name="CheckCircle" size={20} />
                <span>{success}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  <Icon name="Save" size={20} />
                  Сохранить
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <Icon name="X" size={20} />
                  Отмена
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                <Icon name="Edit" size={20} />
                Редактировать профиль
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shield" size={24} />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Защита данных</p>
              <p>Ваш PIN-код надежно защищен. Никому не сообщайте свой PIN-код.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}