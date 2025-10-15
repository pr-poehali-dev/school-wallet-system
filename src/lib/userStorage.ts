interface User {
  fullName: string;
  pinCode: string;
  balance: number;
}

interface Transaction {
  type: 'deposit' | 'withdrawal' | 'game' | 'staff_add';
  amount: number;
  description: string;
  timestamp: string;
}

class UserStorage {
  private USERS_KEY = 'zov_bank_users';
  private TRANSACTIONS_KEY = 'zov_bank_transactions';

  getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  registerUser(fullName: string, pinCode: string): User {
    const users = this.getUsers();
    const existingUser = users.find(u => u.fullName === fullName);
    
    if (existingUser) {
      return existingUser;
    }

    const newUser: User = {
      fullName,
      pinCode,
      balance: 0
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  getUser(fullName: string, pinCode: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.fullName === fullName && u.pinCode === pinCode);
    return user || null;
  }

  updateUser(oldFullName: string, oldPinCode: string, newFullName: string, newPinCode: string): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.fullName === oldFullName && u.pinCode === oldPinCode);
    
    if (userIndex === -1) {
      return false;
    }

    users[userIndex].fullName = newFullName;
    users[userIndex].pinCode = newPinCode;
    this.saveUsers(users);

    const transactions = this.getTransactions();
    const updatedTransactions: { [key: string]: Transaction[] } = {};
    
    Object.keys(transactions).forEach(key => {
      if (key === oldFullName) {
        updatedTransactions[newFullName] = transactions[key];
      } else {
        updatedTransactions[key] = transactions[key];
      }
    });
    
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));

    return true;
  }

  getUserBalance(fullName: string): number {
    const users = this.getUsers();
    const user = users.find(u => u.fullName === fullName);
    return user ? user.balance : 0;
  }

  updateBalance(fullName: string, amount: number): void {
    const users = this.getUsers();
    const user = users.find(u => u.fullName === fullName);
    
    if (user) {
      user.balance += amount;
      this.saveUsers(users);
    }
  }

  setBalance(fullName: string, balance: number): void {
    const users = this.getUsers();
    const user = users.find(u => u.fullName === fullName);
    
    if (user) {
      user.balance = balance;
      this.saveUsers(users);
    }
  }

  getTransactions(): { [fullName: string]: Transaction[] } {
    const transactions = localStorage.getItem(this.TRANSACTIONS_KEY);
    return transactions ? JSON.parse(transactions) : {};
  }

  getUserTransactions(fullName: string): Transaction[] {
    const allTransactions = this.getTransactions();
    return allTransactions[fullName] || [];
  }

  addTransaction(fullName: string, transaction: Transaction): void {
    const allTransactions = this.getTransactions();
    
    if (!allTransactions[fullName]) {
      allTransactions[fullName] = [];
    }
    
    allTransactions[fullName].unshift(transaction);
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(allTransactions));
  }
}

export const userStorage = new UserStorage();
