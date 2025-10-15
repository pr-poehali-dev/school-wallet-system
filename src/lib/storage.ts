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
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    storage.setDepositRequests(updated);
    
    if (status === 'approved') {
      const request = requests.find(req => req.id === id);
      if (request) {
        storage.updateUserBalance(request.userId, request.amount);
      }
    }
  },

  updateWithdrawalRequestStatus: (id: number, status: 'approved' | 'rejected') => {
    const requests = storage.getWithdrawalRequests();
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    storage.setWithdrawalRequests(updated);
    
    if (status === 'approved') {
      const request = requests.find(req => req.id === id);
      if (request) {
        storage.updateUserBalance(request.userId, -request.amount);
      }
    }
  },

  getUserBalance: (userId: string): number => {
    const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
    return balances[userId] || 0;
  },

  updateUserBalance: (userId: string, amount: number) => {
    const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
    balances[userId] = (balances[userId] || 0) + amount;
    localStorage.setItem('userBalances', JSON.stringify(balances));
  },

  setUserBalance: (userId: string, balance: number) => {
    const balances = JSON.parse(localStorage.getItem('userBalances') || '{}');
    balances[userId] = balance;
    localStorage.setItem('userBalances', JSON.stringify(balances));
  },
};