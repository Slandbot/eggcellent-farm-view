import { User, LoginCredentials, RegisterData, UserRole } from "@/types/auth"

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "admin@farm.com",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    createdAt: "2024-01-15T08:00:00Z",
    lastLogin: new Date().toISOString()
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    email: "manager@farm.com",
    role: "Farm Manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    createdAt: "2024-02-01T09:30:00Z",
    lastLogin: new Date().toISOString()
  },
  {
    id: "3",
    name: "Mike Wilson", 
    email: "worker@farm.com",
    role: "Worker",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    createdAt: "2024-02-15T07:00:00Z",
    lastLogin: new Date().toISOString()
  }
]

const AUTH_STORAGE_KEY = "farmtrack_auth"
const USERS_STORAGE_KEY = "farmtrack_users"

class AuthService {
  constructor() {
    // Initialize mock users in localStorage if not exists
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS))
    }
  }

  private getUsers(): User[] {
    const users = localStorage.getItem(USERS_STORAGE_KEY)
    return users ? JSON.parse(users) : MOCK_USERS
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const users = this.getUsers()
    const user = users.find(u => u.email === credentials.email)

    if (!user) {
      throw new Error("User not found")
    }

    // In a real app, you'd verify the password hash
    if (credentials.password !== "password123") {
      throw new Error("Invalid password")
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    this.saveUsers(users)

    // Store session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    
    return user
  }

  async register(data: RegisterData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const users = this.getUsers()
    
    // Check if email already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error("Email already registered")
    }

    const newUser: User = {
      id: this.generateId(),
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    users.push(newUser)
    this.saveUsers(users)
    
    // Store session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
    
    return newUser
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEY)
    return userJson ? JSON.parse(userJson) : null
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    
    if (userIndex === -1) {
      throw new Error("User not found")
    }

    const updatedUser = { ...users[userIndex], ...updates }
    users[userIndex] = updatedUser
    this.saveUsers(users)
    
    // Update session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
    
    return updatedUser
  }

  getAllUsers(): User[] {
    return this.getUsers()
  }

  async deleteUser(userId: string): Promise<void> {
    const users = this.getUsers()
    const filteredUsers = users.filter(u => u.id !== userId)
    this.saveUsers(filteredUsers)
  }

  switchRole(role: UserRole): void {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      currentUser.role = role
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser))
    }
  }
}

export const authService = new AuthService()