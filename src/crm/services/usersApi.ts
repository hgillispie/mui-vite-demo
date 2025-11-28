// User data types based on the Users API
export interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: {
    offset: string;
    description: string;
  };
}

export interface UserName {
  title: string;
  first: string;
  last: string;
}

export interface UserLogin {
  uuid: string;
  username: string;
  password: string;
}

export interface UserDob {
  date: string;
  age: number;
}

export interface UserRegistered {
  date: string;
  age: number;
}

export interface UserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface User {
  login: UserLogin;
  name: UserName;
  gender: string;
  location: UserLocation;
  email: string;
  dob: UserDob;
  registered: UserRegistered;
  phone: string;
  cell: string;
  picture: UserPicture;
  nat: string;
}

export interface UserListResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export interface CreateUserRequest {
  email: string;
  login: {
    username: string;
    password?: string;
  };
  name: {
    first: string;
    last: string;
    title?: string;
  };
  gender?: string;
  location?: Partial<UserLocation>;
}

export interface UpdateUserRequest {
  name?: Partial<UserName>;
  email?: string;
  location?: Partial<UserLocation>;
  phone?: string;
  cell?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  uuid?: string;
}

// Users API service
class UsersApiService {
  private baseUrl = 'https://user-api.builder-io.workers.dev/api';

  async getUsers(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    span?: string;
  }): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.perPage) searchParams.append('perPage', params.perPage.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.span) searchParams.append('span', params.span);

    const url = `${this.baseUrl}/users${searchParams.toString() ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const usersApi = new UsersApiService();
