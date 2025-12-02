import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    first: string;
    last: string;
  };
  email: string;
  picture: {
    thumbnail: string;
  };
  location: {
    city: string;
    country: string;
  };
  phone: string;
}

interface CustomersTableProps {
  onEditUser: (user: User) => void;
}

export default function CustomersTable({ onEditUser }: CustomersTableProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [totalUsers, setTotalUsers] = React.useState(0);

  const fetchUsers = React.useCallback(
    async (pageNum: number, searchQuery: string) => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          page: (pageNum + 1).toString(),
          perPage: rowsPerPage.toString(),
          ...(searchQuery && { search: searchQuery }),
        });

        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.data || []);
        setTotalUsers(data.total || 0);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred while fetching users"
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [rowsPerPage]
  );

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(0);
      fetchUsers(0, searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchUsers]);

  React.useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page, rowsPerPage, fetchUsers]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3">
            Customers
          </Typography>
          <TextField
            placeholder="Search customers by name, email, or city..."
            size="small"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "action.active" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: "100%" }}
          />
        </Stack>
      </CardContent>

      {error && (
        <Box sx={{ px: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading && users.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer sx={{ flexGrow: 1 }}>
            <Table size="small" aria-label="customers table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        No customers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.login.uuid} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            src={user.picture.thumbnail}
                            sx={{ width: 32, height: 32 }}
                          >
                            {getInitials(user.name.first, user.name.last)}
                          </Avatar>
                          {user.name.first} {user.name.last}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.location.city}, {user.location.country}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="edit user"
                          onClick={() => onEditUser(user)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Card>
  );
}
