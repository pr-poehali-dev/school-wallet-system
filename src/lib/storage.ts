export interface DepositRequest {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface WithdrawalRequest {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const storage = {
  getDepositRequests: (): DepositRequest[] => {
    const data = localStorage.getItem('depositRequests');
    return data ? JSON.parse(data) : [];
  },

  setDepositRequests: (requests: DepositRequest[]) => {
    localStorage.setItem('depositRequests', JSON.stringify(requests));
    window.dispatchEvent(new StorageEvent('storage', { key: 'depositRequests' }));
  },

  addDepositRequest: (request: Omit<DepositRequest, 'id' | 'date' | 'status'>) => {
    const requests = storage.getDepositRequests();
    const newRequest: DepositRequest = {
      ...request,
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU'),
      status: 'pending',
    };
    requests.push(newRequest);
    storage.setDepositRequests(requests);
    return newRequest;
  },

  getWithdrawalRequests: (): WithdrawalRequest[] => {
    const data = localStorage.getItem('withdrawalRequests');
    return data ? JSON.parse(data) : [];
  },

  setWithdrawalRequests: (requests: WithdrawalRequest[]) => {
    localStorage.setItem('withdrawalRequests', JSON.stringify(requests));
    window.dispatchEvent(new StorageEvent('storage', { key: 'withdrawalRequests' }));
  },

  addWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
    const requests = storage.getWithdrawalRequests();
    const newRequest: WithdrawalRequest = {
      ...request,
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU'),
      status: 'pending',
    };
    requests.push(newRequest);
    storage.setWithdrawalRequests(requests);
    return newRequest;
  },

  updateDepositRequestStatus: (id: number, status: 'approved' | 'rejected') => {
    const requests = storage.getDepositRequests();
    const request = requests.find(req => req.id === id);
    
    if (status === 'approved' && request) {
      storage.updateUserBalance(request.userName, request.amount);
      
      storage.addTransaction(request.userName, {
        type: 'deposit',
        amount: request.amount,
        description: 'Пополнение одобрено',
        timestamp: new Date().toISOString()
      });
    }
    
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    storage.setDepositRequests(updated);
  },

  updateWithdrawalRequestStatus: (id: number, status: 'approved' | 'rejected') => {
    const requests = storage.getWithdrawalRequests();
    const request = requests.find(req => req.id === id);
    
    if (status === 'approved' && request) {
      storage.updateUserBalance(request.userName, -request.amount);
      
      storage.addTransaction(request.userName, {
        type: 'withdrawal',
        amount: -request.amount,
        description: 'Вывод одобрен',
        timestamp: new Date().toISOString()
      });
    }
    
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    storage.setWithdrawalRequests(updated);
  },

  getUserBalance: (userId: string): number => {
    const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
    return balances[userId] || 0;
  },

  updateUserBalance: (userId: string, amount: number) => {
    const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
    balances[userId] = (balances[userId] || 0) + amount;
    localStorage.setItem('userBalances', JSON.stringify(balances));
    window.dispatchEvent(new StorageEvent('storage', { key: 'userBalances' }));
  },

  setUserBalance: (userId: string, balance: number) => {
    const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
    balances[userId] = balance;
    localStorage.setItem('userBalances', JSON.stringify(balances));
    window.dispatchEvent(new StorageEvent('storage', { key: 'userBalances' }));
  },

  getUsers: () => {
    const users = localStorage.getItem('zov_users');
    return users ? JSON.parse(users) : [];
  },

  saveUsers: (users: any[]) => {
    localStorage.setItem('zov_users', JSON.stringify(users));
    window.dispatchEvent(new StorageEvent('storage', { key: 'zov_users' }));
  },

  registerUser: (fullName: string, pinCode: string) => {
    const users = storage.getUsers();
    const existing = users.find((u: any) => u.fullName === fullName);
    if (existing) {
      throw new Error('ФИО уже занято');
    }
    
    const newUser = { fullName, pinCode, balance: 0, createdAt: new Date().toISOString() };
    users.push(newUser);
    storage.saveUsers(users);
    storage.setUserBalance(fullName, 0);
    
    const stats = JSON.parse(localStorage.getItem('zov_user_stats') || '{}');
    stats[fullName] = {
      lastVisit: new Date().toISOString(),
      casinoWins: 0,
      totalTransactions: 0
    };
    localStorage.setItem('zov_user_stats', JSON.stringify(stats));
    
    return newUser;
  },

  getUser: (fullName: string, pinCode: string) => {
    const users = storage.getUsers();
    return users.find((u: any) => u.fullName === fullName && u.pinCode === pinCode) || null;
  },

  updateUser: (oldFullName: string, oldPinCode: string, newFullName: string, newPinCode: string) => {
    const users = storage.getUsers();
    const index = users.findIndex((u: any) => u.fullName === oldFullName && u.pinCode === oldPinCode);
    if (index === -1) return false;
    
    const balance = storage.getUserBalance(oldFullName);
    users[index] = { fullName: newFullName, pinCode: newPinCode, balance };
    storage.saveUsers(users);
    
    if (oldFullName !== newFullName) {
      storage.setUserBalance(newFullName, balance);
      const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
      delete balances[oldFullName];
      localStorage.setItem('userBalances', JSON.stringify(balances));
    }
    
    return true;
  },

  addTransaction: (userId: string, transaction: any) => {
    const transactions = JSON.parse(localStorage.getItem('zov_transactions') || '{}');
    if (!transactions[userId]) transactions[userId] = [];
    transactions[userId].unshift(transaction);
    localStorage.setItem('zov_transactions', JSON.stringify(transactions));
    
    const stats = JSON.parse(localStorage.getItem('zov_user_stats') || '{}');
    if (!stats[userId]) {
      stats[userId] = { lastVisit: new Date().toISOString(), casinoWins: 0, totalTransactions: 0 };
    }
    stats[userId].totalTransactions = (stats[userId].totalTransactions || 0) + 1;
    localStorage.setItem('zov_user_stats', JSON.stringify(stats));
  },

  getUserTransactions: (userId: string) => {
    const transactions = JSON.parse(localStorage.getItem('zov_transactions') || '{}');
    return transactions[userId] || [];
  },

  getUserStats: (userId: string) => {
    const stats = JSON.parse(localStorage.getItem('zov_user_stats') || '{}');
    return stats[userId] || { lastVisit: null, casinoWins: 0, totalTransactions: 0 };
  },

  updateUserStats: (userId: string, updates: any) => {
    const stats = JSON.parse(localStorage.getItem('zov_user_stats') || '{}');
    if (!stats[userId]) {
      stats[userId] = { lastVisit: new Date().toISOString(), casinoWins: 0, totalTransactions: 0 };
    }
    stats[userId] = { ...stats[userId], ...updates };
    localStorage.setItem('zov_user_stats', JSON.stringify(stats));
  },

  updateLastVisit: (userId: string) => {
    const stats = JSON.parse(localStorage.getItem('zov_user_stats') || '{}');
    if (!stats[userId]) {
      stats[userId] = { lastVisit: new Date().toISOString(), casinoWins: 0, totalTransactions: 0 };
    }
    stats[userId].lastVisit = new Date().toISOString();
    localStorage.setItem('zov_user_stats', JSON.stringify(stats));
  },
};