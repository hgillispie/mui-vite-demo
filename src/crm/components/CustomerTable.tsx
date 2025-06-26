import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Alert,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { Customer } from "../types/Customer";

/**
 * Props interface for the CustomerTable component
 * Handles the display and interaction of customer data in a DataGrid format
 */
interface CustomerTableProps {
  /** Array of customer objects to display in the table */
  customers: Customer[];
  /** Boolean flag indicating if data is currently being fetched from the API */
  loading: boolean;
  /** Error message string if API request failed, null if no error */
  error: string | null;
  /** Total number of customers available on the server (for pagination) */
  total: number;
  /** Current page number (1-based indexing) */
  page: number;
  /** Number of items to display per page */
  perPage: number;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const getAgeColor = (
  age: number,
): "default" | "primary" | "secondary" | "success" | "warning" => {
  if (age < 25) return "primary";
  if (age < 35) return "success";
  if (age < 50) return "warning";
  return "secondary";
};

export default function CustomerTable({
  customers,
  loading,
  error,
  total,
  page,
  perPage,
  search,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEditCustomer,
  onDeleteCustomer,
}: CustomerTableProps) {
  const [searchInput, setSearchInput] = React.useState(search);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const handlePaginationChange = (model: GridPaginationModel) => {
    onPageChange(model.page + 1); // DataGrid uses 0-based page indexing
    onPageSizeChange(model.pageSize);
  };

  const handleSortChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const sort = model[0];
      let sortBy = sort.field;

      // Map column fields to API sort fields
      switch (sort.field) {
        case "fullName":
          sortBy = "name.first";
          break;
        case "email":
          sortBy = "email";
          break;
        case "age":
          sortBy = "dob.age";
          break;
        case "city":
          sortBy = "location.city";
          break;
        case "country":
          sortBy = "location.country";
          break;
        case "registeredDate":
          sortBy = "registered.date";
          break;
        default:
          sortBy = "name.first";
      }

      onSortChange(sortBy);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture.thumbnail}
          alt={params.row.fullName}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {params.row.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{params.row.login.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getAgeColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: "city",
      headerName: "City",
      width: 130,
    },
    {
      field: "country",
      headerName: "Country",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">{params.row.location.country}</Typography>
          <Typography variant="caption" color="text.secondary">
            ({params.row.nat})
          </Typography>
        </Box>
      ),
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={params.value === "male" ? "primary" : "secondary"}
        />
      ),
    },
    {
      field: "registeredDate",
      headerName: "Registered",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.row.registered.date)}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEditCustomer(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => onDeleteCustomer(params.row)}
          color="error"
        />,
      ],
    },
  ];

  // Transform customers data for DataGrid
  const rows = customers.map((customer) => ({
    id: customer.login.uuid,
    ...customer,
    fullName: `${customer.name.title} ${customer.name.first} ${customer.name.last}`,
    age: customer.dob.age,
    city: customer.location.city,
  }));

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Customer Database
          </Typography>
          <TextField
            size="small"
            placeholder="Search customers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          sortingMode="server"
          loading={loading}
          rowCount={total}
          paginationModel={{
            page: page - 1, // DataGrid uses 0-based page indexing
            pageSize: perPage,
          }}
          onPaginationModelChange={handlePaginationChange}
          onSortModelChange={handleSortChange}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          slots={{
            loadingOverlay: LinearProgress,
          }}
          sx={{
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },
          }}
        />
      </Box>
    </Card>
  );
}
