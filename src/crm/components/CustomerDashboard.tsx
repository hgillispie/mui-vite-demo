import * as React from "react";
import {
  Box,
  Grid,
  Typography,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import CustomerTable from "./CustomerTable";
import CustomerEditModal from "./CustomerEditModal";
import CrmStatCard from "./CrmStatCard";
import { useCustomers } from "../hooks/useCustomers";
import { Customer, CustomerUpdateData } from "../types/Customer";

export default function CustomerDashboard() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [editCustomer, setEditCustomer] = React.useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = React.useState<Customer | null>(
    null,
  );

  const {
    customers,
    loading,
    error,
    total,
    refreshCustomers,
    updateCustomer,
    deleteCustomer: deleteCustomerApi,
  } = useCustomers({
    page,
    perPage,
    search,
    sortBy,
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!customers.length) {
      return {
        totalCustomers: 0,
        avgAge: 0,
        maleCount: 0,
        femaleCount: 0,
        countries: 0,
        recentRegistrations: 0,
      };
    }

    const totalCustomers = total;
    const avgAge = Math.round(
      customers.reduce((sum, customer) => sum + customer.dob.age, 0) /
        customers.length,
    );
    const maleCount = customers.filter((c) => c.gender === "male").length;
    const femaleCount = customers.filter((c) => c.gender === "female").length;
    const countries = new Set(customers.map((c) => c.location.country)).size;

    // Count registrations in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = customers.filter(
      (c) => new Date(c.registered.date) > thirtyDaysAgo,
    ).length;

    return {
      totalCustomers,
      avgAge,
      maleCount,
      femaleCount,
      countries,
      recentRegistrations,
    };
  }, [customers, total]);

  const handleEditCustomer = (customer: Customer) => {
    setEditCustomer(customer);
  };

  const handleCloseEditModal = () => {
    setEditCustomer(null);
  };

  const handleSaveCustomer = async (
    id: string,
    data: CustomerUpdateData,
  ): Promise<boolean> => {
    const success = await updateCustomer(id, data);
    if (success) {
      setEditCustomer(null);
    }
    return success;
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeleteCustomer(customer);
  };

  const handleConfirmDelete = async () => {
    if (deleteCustomer) {
      const success = await deleteCustomerApi(deleteCustomer.login.uuid);
      if (success) {
        setDeleteCustomer(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteCustomer(null);
  };

  // Generate sample data for charts
  const generateSampleData = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 100) + 20);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customer Management Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <CrmStatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            interval="All time"
            trend="up"
            trendValue="+12%"
            data={generateSampleData(7)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <CrmStatCard
            title="Average Age"
            value={`${stats.avgAge} years`}
            interval="Current dataset"
            trend="up"
            trendValue="+2%"
            data={generateSampleData(7)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <CrmStatCard
            title="Male Customers"
            value={stats.maleCount.toString()}
            interval="Current page"
            trend="up"
            trendValue="+5%"
            data={generateSampleData(7)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <CrmStatCard
            title="Female Customers"
            value={stats.femaleCount.toString()}
            interval="Current page"
            trend="down"
            trendValue="-3%"
            data={generateSampleData(7)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <CrmStatCard
            title="Countries"
            value={stats.countries.toString()}
            interval="Current page"
            trend="up"
            trendValue="+1"
            data={generateSampleData(7)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <CrmStatCard
            title="New This Month"
            value={stats.recentRegistrations.toString()}
            interval="Last 30 days"
            trend="up"
            trendValue="+8%"
            data={generateSampleData(7)}
          />
        </Grid>
      </Grid>

      {/* Customer Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        error={error}
        total={total}
        page={page}
        perPage={perPage}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onPageSizeChange={setPerPage}
        onSortChange={setSortBy}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
      />

      {/* Edit Modal */}
      <CustomerEditModal
        open={Boolean(editCustomer)}
        customer={editCustomer}
        onClose={handleCloseEditModal}
        onSave={handleSaveCustomer}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteCustomer)}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>
              {deleteCustomer &&
                `${deleteCustomer.name.first} ${deleteCustomer.name.last}`}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
