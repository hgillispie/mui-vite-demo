export interface CustomerLocation {
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

export interface CustomerName {
  title: string;
  first: string;
  last: string;
}

export interface CustomerLogin {
  uuid: string;
  username: string;
  password: string;
}

export interface CustomerDob {
  date: string;
  age: number;
}

export interface CustomerRegistered {
  date: string;
  age: number;
}

export interface CustomerPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface Customer {
  login: CustomerLogin;
  name: CustomerName;
  gender: string;
  location: CustomerLocation;
  email: string;
  dob: CustomerDob;
  registered: CustomerRegistered;
  phone: string;
  cell: string;
  picture: CustomerPicture;
  nat: string;
}

export interface CustomersApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: Customer[];
}

export interface CustomerUpdateData {
  name?: Partial<CustomerName>;
  location?: Partial<CustomerLocation>;
  email?: string;
  phone?: string;
  cell?: string;
  gender?: string;
}
