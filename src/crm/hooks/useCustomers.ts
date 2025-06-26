import { useState, useEffect, useCallback } from "react";
import {
  Customer,
  CustomersApiResponse,
  CustomerUpdateData,
} from "../types/Customer";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export interface UseCustomersParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  perPage: number;
  refreshCustomers: () => void;
  updateCustomer: (id: string, data: CustomerUpdateData) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  createCustomer: (customer: Partial<Customer>) => Promise<boolean>;
}

export function useCustomers({
  page = 1,
  perPage = 10,
  search = "",
  sortBy = "name.first",
}: UseCustomersParams = {}): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        sortBy,
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`${API_BASE_URL}/users?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const data: CustomersApiResponse = await response.json();
      setCustomers(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch customers",
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, sortBy]);

  const updateCustomer = useCallback(
    async (id: string, updateData: CustomerUpdateData): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update customer: ${response.statusText}`);
        }

        // Refresh the customer list after successful update
        await fetchCustomers();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update customer",
        );
        return false;
      }
    },
    [fetchCustomers],
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete customer: ${response.statusText}`);
        }

        // Refresh the customer list after successful deletion
        await fetchCustomers();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete customer",
        );
        return false;
      }
    },
    [fetchCustomers],
  );

  const createCustomer = useCallback(
    async (customerData: Partial<Customer>): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create customer: ${response.statusText}`);
        }

        // Refresh the customer list after successful creation
        await fetchCustomers();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create customer",
        );
        return false;
      }
    },
    [fetchCustomers],
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    total,
    page,
    perPage,
    refreshCustomers: fetchCustomers,
    updateCustomer,
    deleteCustomer,
    createCustomer,
  };
}
