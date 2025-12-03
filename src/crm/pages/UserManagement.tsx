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
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface User {
  uuid: string;
  login: {
    username: string;
  };
  name: {
    first: string;
    last: string;
    title: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  picture: {
    thumbnail: string;
  };
  registered: {
    age: number;
  };
  dob: {
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterProperty, setFilterProperty] = React.useState("name.first");
  const [loading, setLoading] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";
      const sortParam = `&sortBy=${filterProperty}`;
      const url = `https://user-api.builder-io.workers.dev/api/users?page=${page + 1}&perPage=${rowsPerPage}${searchParam}${sortParam}`;

      const response = await fetch(url);
      const data: UsersResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterProperty]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  type ChipColor = "default" | "warning" | "success";

  const getStatusColor = (accountStatus: string): ChipColor => {
    const colorMap: Record<string, ChipColor> = {
      Active: "success",
      Suspended: "warning",
      Inactive: "default",
    };
    return colorMap[accountStatus] || "default";
  };

  const getInitials = (user: User) => {
    const firstInitial = user?.name?.first?.[0] || "U";
    const lastInitial = user?.name?.last?.[0] || "M";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getUserId = (user: User) => {
    if (!user?.uuid) return "N/A";
    return typeof user.uuid === "string" ? user.uuid.slice(0, 8) : "N/A";
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Card variant="outlined">
        <CardContent>
          {/* Header */}
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            User management
          </Typography>

          {/* Toolbar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3, alignItems: { xs: "stretch", sm: "center" } }}
          >
            <TextField
              placeholder="Name, email, etc..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="filter-select-label">Attribute</InputLabel>
              <Select
                labelId="filter-select-label"
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                label="Attribute"
              >
                <MenuItem value="name.first">First Name</MenuItem>
                <MenuItem value="name.last">Last Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="location.city">City</MenuItem>
                <MenuItem value="location.country">Country</MenuItem>
                <MenuItem value="dob.age">Age</MenuItem>
                <MenuItem value="registered.date">Registration Date</MenuItem>
              </Select>
            </FormControl>

            <IconButton size="small" title="Filter">
              <FilterAltIcon />
            </IconButton>

            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <Button variant="outlined" size="small">
                Action
              </Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>
                New
              </Button>
              <IconButton size="small" title="Settings">
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Table */}
          <TableContainer>
            <Table aria-label="user management table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Account status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const key = user?.uuid || `user-${Math.random()}`;
                  return (
                    <TableRow key={key} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={user?.picture?.thumbnail}
                            alt={user?.name?.first || "User"}
                          >
                            {getInitials(user)}
                          </Avatar>
                          <Typography variant="body2">
                            {user?.name?.first || ""} {user?.name?.last || ""}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user?.email || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationOnIcon sx={{ fontSize: 20, opacity: 0.56 }} />
                          <Typography variant="body2">
                            {user?.location?.city || "N/A"}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Active"
                          size="small"
                          color={getStatusColor("Active")}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{getUserId(user)}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                    colSpan={5}
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
