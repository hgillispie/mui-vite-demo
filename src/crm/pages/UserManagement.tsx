import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  picture?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  registered?: {
    date: string;
    age: number;
  };
}

interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

export default function UserManagement() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortAttribute, setSortAttribute] = React.useState("name.first");
  const [loading, setLoading] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        perPage: rowsPerPage.toString(),
        sortBy: sortAttribute,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`
      );
      const data: UsersResponse = await response.json();
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, sortAttribute]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((user) => user.login.uuid);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const getStatusChip = (user: User) => {
    const isSuspended = user.registered && user.registered.age < 2;
    
    return (
      <Chip
        label={isSuspended ? "Suspended" : "Active"}
        size="medium"
        color={isSuspended ? "warning" : "default"}
        sx={{
          borderRadius: "100px",
        }}
      />
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          User management
        </Typography>

        <Paper elevation={1} sx={{ borderRadius: 1 }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <TextField
                label="Search"
                variant="outlined"
                size="medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, etc..."
                sx={{ width: 300 }}
              />

              <FormControl variant="outlined" size="medium" sx={{ width: 180 }}>
                <InputLabel>Attribute</InputLabel>
                <Select
                  value={sortAttribute}
                  onChange={(e) => setSortAttribute(e.target.value)}
                  label="Attribute"
                >
                  <MenuItem value="name.first">First Name</MenuItem>
                  <MenuItem value="name.last">Last Name</MenuItem>
                  <MenuItem value="location.city">City</MenuItem>
                  <MenuItem value="location.country">Country</MenuItem>
                  <MenuItem value="dob.age">Age</MenuItem>
                  <MenuItem value="registered.date">Registration Date</MenuItem>
                </Select>
              </FormControl>

              <IconButton size="medium">
                <FilterAltIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button variant="outlined" color="inherit">
                ACTION
              </Button>
              <Button variant="contained" color="primary">
                NEW
              </Button>
              <IconButton size="medium">
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 && selected.length < users.length
                      }
                      checked={users.length > 0 && selected.length === users.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Account status</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const isItemSelected = isSelected(user.login.uuid);
                    return (
                      <TableRow
                        key={user.login.uuid}
                        hover
                        onClick={() => handleClick(user.login.uuid)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox color="primary" checked={isItemSelected} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              alt={`${user.name.first} ${user.name.last}`}
                              src={user.picture?.thumbnail}
                              sx={{ width: 40, height: 40 }}
                            />
                            <Typography variant="body2">
                              {user.name.first} {user.name.last}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon fontSize="small" />
                            <Typography variant="body2">
                              {user.location.city}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{getStatusChip(user)}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.login.uuid.substring(0, 8)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Box>
  );
}
