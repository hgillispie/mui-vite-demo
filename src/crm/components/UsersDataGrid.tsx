import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { DataGrid, GridColDef, GridCellParams, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { User, usersApi, UserListResponse } from "../services/usersApi";

interface UsersDataGridProps {
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
}

// Render avatar for user
function renderUserAvatar(params: GridCellParams<User>) {
  const user = params.row as User;

  if (!user || !user.name) {
    return null;
  }

  const fullName = `${user.name.first} ${user.name.last}`;
  const initials = `${user.name.first.charAt(0)}${user.name.last.charAt(0)}`.toUpperCase();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar
        src={user.picture?.thumbnail}
        alt={fullName}
        sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {fullName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.name.title}
        </Typography>
      </Box>
    </Box>
  );
}

// Render status based on registration age
function renderUserStatus(params: GridCellParams<User>) {
  const user = params.row as User;
  const registrationAge = user.registered.age;
  
  let status: "New" | "Active" | "Veteran";
  let color: "info" | "success" | "warning";
  
  if (registrationAge < 1) {
    status = "New";
    color = "info";
  } else if (registrationAge < 3) {
    status = "Active"; 
    color = "success";
  } else {
    status = "Veteran";
    color = "warning";
  }
  
  return <Chip label={status} color={color} size="small" variant="outlined" />;
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function UsersDataGrid({ onEditUser, onDeleteUser }: UsersDataGridProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [totalRows, setTotalRows] = useState(0);

  // Debounced search to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response: UserListResponse = await usersApi.getUsers({
        page: paginationModel.page + 1, // API uses 1-based pagination
        perPage: paginationModel.pageSize,
        search: debouncedSearchQuery || undefined,
        sortBy: "name.first",
      });
      
      // Convert users to have an id field for DataGrid
      const usersWithIds = response.data.map((user) => ({
        ...user,
        id: user.login.uuid,
      }));
      
      setUsers(usersWithIds);
      setTotalRows(response.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      // TODO: Add proper error handling/notifications
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (user: User) => {
    if (onDeleteUser) {
      onDeleteUser(user);
    }
  };

  const handleEditUser = (user: User) => {
    if (onEditUser) {
      onEditUser(user);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "User",
      flex: 1.5,
      minWidth: 200,
      renderCell: renderUserAvatar,
      sortable: false,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const user = params.row as User;
        if (!user || !user.location) return "";
        return `${user.location.city}, ${user.location.country}`;
      },
      sortable: false,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "age",
      headerName: "Age",
      flex: 0.5,
      minWidth: 80,
      align: "center",
      headerAlign: "center",
      valueGetter: (params) => {
        const user = params.row as User;
        if (!user || !user.dob) return "";
        return user.dob.age;
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 100,
      renderCell: renderUserStatus,
      sortable: false,
    },
    {
      field: "registered",
      headerName: "Registered",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => {
        const user = params.row as User;
        if (!user || !user.registered) return "";
        return formatDate(user.registered.date);
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditUser(params.row as User)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteUser(params.row as User)}
        />,
      ],
    },
  ];

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2">
            Customer Directory
          </Typography>
          <TextField
            size="small"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Stack>
        
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={totalRows}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            density="compact"
            disableColumnResize
            disableRowSelectionOnClick
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            slotProps={{
              filterPanel: {
                filterFormProps: {
                  logicOperatorInputProps: {
                    variant: "outlined",
                    size: "small",
                  },
                  columnInputProps: {
                    variant: "outlined", 
                    size: "small",
                    sx: { mt: "auto" },
                  },
                  operatorInputProps: {
                    variant: "outlined",
                    size: "small", 
                    sx: { mt: "auto" },
                  },
                  valueInputProps: {
                    InputComponentProps: {
                      variant: "outlined",
                      size: "small",
                    },
                  },
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
