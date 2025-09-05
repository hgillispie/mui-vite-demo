import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import UsersDataGrid from "../components/UsersDataGrid";
import UserEditModal from "../components/UserEditModal";
import UserDeleteDialog from "../components/UserDeleteDialog";
import { User, usersApi, UserListResponse } from "../services/usersApi";

interface DashboardStats {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  topCountries: { country: string; count: number }[];
}

export default function Customers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCustomers: 0,
    newThisMonth: 0,
    activeCustomers: 0,
    topCountries: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch a sample of users to calculate stats
        const response: UserListResponse = await usersApi.getUsers({
          page: 1,
          perPage: 50,
        });
        
        const { data: users, total } = response;
        
        // Calculate new customers this month
        const currentDate = new Date();
        const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        
        const newThisMonth = users.filter(user => {
          const registrationDate = new Date(user.registered.date);
          return registrationDate >= oneMonthAgo;
        }).length;
        
        // Calculate active customers (registered more than 1 month ago)
        const activeCustomers = users.filter(user => {
          const registrationDate = new Date(user.registered.date);
          return registrationDate < oneMonthAgo;
        }).length;
        
        // Calculate top countries
        const countryCount = users.reduce((acc, user) => {
          const country = user.location.country;
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const topCountries = Object.entries(countryCount)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        
        setDashboardStats({
          totalCustomers: total,
          newThisMonth,
          activeCustomers,
          topCountries,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    // Trigger a refresh of the data grid
    setRefreshKey(prev => prev + 1);
  };

  const handleUserDeleted = (deletedUser: User) => {
    // Trigger a refresh of the data grid and stats
    setRefreshKey(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Customer Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database and view customer insights
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} size="large">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "rgba(48, 109, 171, 1)",
                    borderRadius: 1,
                    color: "white",
                  }}
                >
                  <PeopleIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.totalCustomers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "success.main",
                    borderRadius: 1,
                    color: "white",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.newThisMonth}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New This Month
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "info.main",
                    borderRadius: 1,
                    color: "white",
                  }}
                >
                  <PeopleIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.activeCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Customers
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "warning.main",
                    borderRadius: 1,
                    color: "white",
                  }}
                >
                  <LocationOnIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Top Countries
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {dashboardStats.topCountries.map((country) => (
                      <Chip
                        key={country.country}
                        label={`${country.country} (${country.count})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Data Grid */}
      <UsersDataGrid
        key={refreshKey}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Edit Modal */}
      <UserEditModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <UserDeleteDialog
        open={deleteDialogOpen}
        user={userToDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onUserDeleted={handleUserDeleted}
      />

      {/* Add Customer FAB */}
      <Fab
        color="primary"
        aria-label="add customer"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
        onClick={() => {
          // TODO: Implement add customer functionality
          console.log("Add customer clicked");
        }}
      >
        <PersonAddIcon />
      </Fab>
    </Box>
  );
}
