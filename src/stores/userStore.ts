import { makeAutoObservable } from 'mobx';

export interface User {
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  permissions?: string[];
}

class UserStore {
  user: User | null = null;
  token: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  get isLoggedIn() {
    return !!this.user;
  }

  get currentUser() {
    return this.user;
  }

  setUser(user: User) {
    this.user = user;
    this.saveToStorage();
  }

  setToken(token: string) {
    this.token = token;
    this.saveToStorage();
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  login(user: User, token: string) {
    this.setUser(user);
    this.setToken(token);
  }

  async fetchCurrentUser() {
    // TODO: 从 API 获取当前用户信息
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  }

  private saveToStorage() {
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
    }
    if (this.token) {
      localStorage.setItem('token', this.token);
    }
  }

  private loadFromStorage() {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userStr) {
        this.user = JSON.parse(userStr);
      }
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      this.logout();
    }
  }
}

export default UserStore;
