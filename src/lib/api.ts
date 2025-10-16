const API_URL = 'https://functions.poehali.dev/e6ffe770-e69c-4e1b-b374-786d1a48dae2';

export const api = {
  async register(fullName: string, pinCode: string) {
    try {
      console.log('Registering:', fullName, pinCode.length, 'chars');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', fullName, pinCode })
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка регистрации');
      }
      const data = await response.json();
      console.log('Registration success:', data);
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Не удалось подключиться к серверу');
    }
  },

  async login(fullName: string, pinCode: string) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', fullName, pinCode })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка входа');
      }
      return response.json();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Не удалось подключиться к серверу');
    }
  },

  async getUsers() {
    const response = await fetch(`${API_URL}?action=users`);
    return response.json();
  },

  async getUserBalance(userId: number) {
    const response = await fetch(`${API_URL}?action=user_balance&userId=${userId}`);
    const data = await response.json();
    return data.balance;
  },

  async updateBalance(userId: number, amount: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_balance', userId, amount })
    });
    return response.json();
  },

  async createDepositRequest(userId: number, amount: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deposit_request', userId, amount })
    });
    return response.json();
  },

  async createWithdrawalRequest(userId: number, amount: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'withdrawal_request', userId, amount })
    });
    return response.json();
  },

  async getDepositRequests() {
    const response = await fetch(`${API_URL}?action=deposit_requests`);
    return response.json();
  },

  async getWithdrawalRequests() {
    const response = await fetch(`${API_URL}?action=withdrawal_requests`);
    return response.json();
  },

  async approveDepositRequest(requestId: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve_deposit', requestId })
    });
    return response.json();
  },

  async rejectDepositRequest(requestId: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject_deposit', requestId })
    });
    return response.json();
  },

  async approveWithdrawalRequest(requestId: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve_withdrawal', requestId })
    });
    return response.json();
  },

  async rejectWithdrawalRequest(requestId: number) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject_withdrawal', requestId })
    });
    return response.json();
  },
};