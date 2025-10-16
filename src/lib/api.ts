interface User {
  id: number;
  fullName: string;
  balance: number;
  pinCode: string;
}

interface DepositRequest {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface WithdrawalRequest {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: 'wallet_users',
  DEPOSITS: 'wallet_deposits',
  WITHDRAWALS: 'wallet_withdrawals',
  COUNTER: 'wallet_counter'
};

function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getDeposits(): DepositRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
  return data ? JSON.parse(data) : [];
}

function saveDeposits(deposits: DepositRequest[]) {
  localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
}

function getWithdrawals(): WithdrawalRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
  return data ? JSON.parse(data) : [];
}

function saveWithdrawals(withdrawals: WithdrawalRequest[]) {
  localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
}

function getNextId(): number {
  const counter = localStorage.getItem(STORAGE_KEYS.COUNTER);
  const id = counter ? parseInt(counter) + 1 : 1;
  localStorage.setItem(STORAGE_KEYS.COUNTER, id.toString());
  return id;
}

export const api = {
  async register(fullName: string, pinCode: string) {
    const users = getUsers();
    
    if (users.find(u => u.fullName === fullName)) {
      throw new Error('ФИО уже занято');
    }
    
    const newUser: User = {
      id: getNextId(),
      fullName,
      pinCode,
      balance: 0
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { id: newUser.id, fullName: newUser.fullName, balance: newUser.balance };
  },

  async login(fullName: string, pinCode: string) {
    const users = getUsers();
    const user = users.find(u => u.fullName === fullName && u.pinCode === pinCode);
    
    if (!user) {
      throw new Error('Неверное ФИО или PIN-код');
    }
    
    return { id: user.id, fullName: user.fullName, balance: user.balance };
  },

  async getUserBalance(userId: number) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    return { balance: user?.balance || 0 };
  },

  async createDepositRequest(userId: number, amount: number) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) throw new Error('Пользователь не найден');
    
    const deposits = getDeposits();
    const newRequest: DepositRequest = {
      id: getNextId(),
      userId,
      userName: user.fullName,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    deposits.push(newRequest);
    saveDeposits(deposits);
    
    return { id: newRequest.id, status: 'pending' };
  },

  async createWithdrawalRequest(userId: number, amount: number) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) throw new Error('Пользователь не найден');
    if (user.balance < amount) throw new Error('Недостаточно средств');
    
    const withdrawals = getWithdrawals();
    const newRequest: WithdrawalRequest = {
      id: getNextId(),
      userId,
      userName: user.fullName,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    withdrawals.push(newRequest);
    saveWithdrawals(withdrawals);
    
    return { id: newRequest.id, status: 'pending' };
  },

  async getUsers() {
    return getUsers().map(({ pinCode, ...user }) => user);
  },

  async getDepositRequests() {
    return getDeposits();
  },

  async getWithdrawalRequests() {
    return getWithdrawals();
  },

  async approveDepositRequest(requestId: number) {
    const deposits = getDeposits();
    const request = deposits.find(r => r.id === requestId);
    
    if (request) {
      request.status = 'approved';
      saveDeposits(deposits);
      
      const users = getUsers();
      const user = users.find(u => u.id === request.userId);
      if (user) {
        user.balance += request.amount;
        saveUsers(users);
      }
    }
    
    return { status: 'approved' };
  },

  async rejectDepositRequest(requestId: number) {
    const deposits = getDeposits();
    const request = deposits.find(r => r.id === requestId);
    
    if (request) {
      request.status = 'rejected';
      saveDeposits(deposits);
    }
    
    return { status: 'rejected' };
  },

  async approveWithdrawalRequest(requestId: number) {
    const withdrawals = getWithdrawals();
    const request = withdrawals.find(r => r.id === requestId);
    
    if (request) {
      request.status = 'approved';
      saveWithdrawals(withdrawals);
      
      const users = getUsers();
      const user = users.find(u => u.id === request.userId);
      if (user) {
        user.balance -= request.amount;
        saveUsers(users);
      }
    }
    
    return { status: 'approved' };
  },

  async rejectWithdrawalRequest(requestId: number) {
    const withdrawals = getWithdrawals();
    const request = withdrawals.find(r => r.id === requestId);
    
    if (request) {
      request.status = 'rejected';
      saveWithdrawals(withdrawals);
    }
    
    return { status: 'rejected' };
  }
};
