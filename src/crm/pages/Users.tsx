import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CircularProgress from "@mui/material/CircularProgress";

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
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export default function Users() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [selected, setSelected] = React.useState<string[]>([]);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        perPage: rowsPerPage.toString(),
        sortBy: sortBy,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`
      );
      const data: UsersResponse = await response.json();
      setUsers(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, sortBy]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((user) => user.login.uuid);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, uuid: string) => {
    const selectedIndex = selected.indexOf(uuid);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uuid);
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

  const isSelected = (uuid: string) => selected.indexOf(uuid) !== -1;

  const getAccountStatus = (user: User) => {
    const registeredAge = user.registered.age;
    if (registeredAge < 2) {
      return { label: "Suspended", color: "warning" as const };
    }
    return { label: "Active", color: "default" as const };
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User management
        </Typography>
      </Box>

      <Card sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 300 }}>
              <TextField
                placeholder="Name, email, etc..."
                label="Search"
                variant="outlined"
                size="medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 300 }}
              />
              <FormControl variant="outlined" size="medium" sx={{ width: 180 }}>
                <InputLabel id="attribute-label">Attribute</InputLabel>
                <Select
                  labelId="attribute-label"
                  value={sortBy}
                  label="Attribute"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name.first">First Name</MenuItem>
                  <MenuItem value="name.last">Last Name</MenuItem>
                  <MenuItem value="location.city">City</MenuItem>
                  <MenuItem value="location.country">Country</MenuItem>
                  <MenuItem value="dob.age">Age</MenuItem>
                  <MenuItem value="registered.date">Registered Date</MenuItem>
                </Select>
              </FormControl>
              <IconButton>
                <FilterAltIcon />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" color="inherit">
                ACTION
              </Button>
              <Button variant="contained" color="primary">
                NEW
              </Button>
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                {users.map((user) => {
                  const isItemSelected = isSelected(user.login.uuid);
                  const status = getAccountStatus(user);
                  const fullName = `${user.name.first} ${user.name.last}`;

                  return (
                    <TableRow
                      key={user.login.uuid}
                      hover
                      onClick={(event) => handleClick(event, user.login.uuid)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isItemSelected} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            alt={fullName}
                            src={user.picture.thumbnail}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Typography variant="body2">{fullName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {user.location.city}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="medium" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.login.uuid.substring(0, 8)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
