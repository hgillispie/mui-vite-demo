import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CakeRoundedIcon from "@mui/icons-material/CakeRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserLocation {
  city: string;
  state: string;
  country: string;
  postcode: string;
  street: { number: number; name: string };
  coordinates: { latitude: number; longitude: number };
  timezone: { offset: string; description: string };
}

interface User {
  login: { uuid: string; username: string; password: string };
  name: { title: string; first: string; last: string };
  gender: string;
  location: UserLocation;
  email: string;
  dob: { date: string; age: number };
  registered: { date: string; age: number };
  phone: string;
  cell: string;
  picture: { large: string; medium: string; thumbnail: string };
  nat: string;
}

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

type SortField =
  | "name.first"
  | "name.last"
  | "location.city"
  | "location.country"
  | "dob.age"
  | "registered.date";

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function CustomerStatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}.50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: `${color}.main`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" component="p" fontWeight={600} sx={{ color: "rgba(65, 117, 5, 1)" }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

function EditUserModal({ user, open, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = React.useState<Partial<User>>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleFieldChange =
    (path: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => {
        const updated = { ...prev };
        const keys = path.split(".");
        let current: Record<string, unknown> = updated as Record<
          string,
          unknown
        >;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...(current[keys[i]] as object) };
          current = current[keys[i]] as Record<string, unknown>;
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (!res.ok) throw new Error("Failed to update user");
      onSave(formData as User);
      onClose();
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const val = (path: string): string => {
    const keys = path.split(".");
    let current: unknown = formData;
    for (const key of keys) {
      if (current == null || typeof current !== "object") return "";
      current = (current as Record<string, unknown>)[key];
    }
    return String(current ?? "");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Edit Customer</Typography>
          <IconButton onClick={onClose} size="small" aria-label="close dialog">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <Avatar
              src={formData.picture?.large}
              alt={`${val("name.first")} ${val("name.last")}`}
              sx={{ width: 56, height: 56 }}
            />
            <Box>
              <Typography fontWeight={600}>
                {val("name.first")} {val("name.last")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {val("login.username")}
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            sx={{ mb: 1 }}
          >
            Personal Info
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                value={val("name.first")}
                onChange={handleFieldChange("name.first")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                value={val("name.last")}
                onChange={handleFieldChange("name.last")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                value={val("email")}
                onChange={handleFieldChange("email")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone"
                value={val("phone")}
                onChange={handleFieldChange("phone")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Cell"
                value={val("cell")}
                onChange={handleFieldChange("cell")}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            sx={{ mb: 1 }}
          >
            Location
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Street"
                value={`${val("location.street.number")} ${val("location.street.name")}`}
                onChange={handleFieldChange("location.street.name")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="City"
                value={val("location.city")}
                onChange={handleFieldChange("location.city")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="State"
                value={val("location.state")}
                onChange={handleFieldChange("location.state")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Country"
                value={val("location.country")}
                onChange={handleFieldChange("location.country")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Postcode"
                value={val("location.postcode")}
                onChange={handleFieldChange("location.postcode")}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ─── Main Customers Page ──────────────────────────────────────────────────────

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Table state
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<SortField>("name.first");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  // Edit modal state
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams({
          page: String(page + 1),
          perPage: String(rowsPerPage),
          sortBy,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        });
        const res = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`,
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const json: ApiResponse = await res.json();
        setUsers(json.data);
        setTotal(json.total);
      } catch {
        setFetchError("Could not load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, rowsPerPage, sortBy, debouncedSearch]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  const handleEditOpen = (user: User) => {
    setEditUser(user);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditUser(null);
  };

  const handleEditSave = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.login.uuid === updated.login.uuid ? { ...u, ...updated } : u,
      ),
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const uniqueCountries = React.useMemo(
    () => new Set(users.map((u) => u.location.country)).size,
    [users],
  );

  const avgAge = React.useMemo(() => {
    if (!users.length) return 0;
    return Math.round(users.reduce((sum, u) => sum + u.dob.age, 0) / users.length);
  }, [users]);

  const newThisMonth = React.useMemo(() => {
    const now = new Date();
    return users.filter((u) => {
      const reg = new Date(u.registered.date);
      return (
        reg.getMonth() === now.getMonth() &&
        reg.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [users]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" component="h2" fontWeight={800}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and view all customer accounts
          </Typography>
        </Box>
      </Stack>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <CustomerStatCard
            icon={<PeopleRoundedIcon />}
            label="Total Customers"
            value={loading ? "…" : total.toLocaleString()}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <CustomerStatCard
            icon={<PublicRoundedIcon />}
            label="Countries Represented"
            value={loading ? "…" : uniqueCountries}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <CustomerStatCard
            icon={<CakeRoundedIcon />}
            label="Average Age"
            value={loading ? "…" : avgAge}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <CustomerStatCard
            icon={<PersonAddRoundedIcon />}
            label="Registered This Month"
            value={loading ? "…" : newThisMonth}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Search + Table */}
      <Card variant="outlined">
        <CardContent sx={{ pb: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" component="h3">
              Customer List
            </Typography>
            <TextField
              placeholder="Search by name, email or city…"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: "100%", sm: 300 } }}
            />
          </Stack>
        </CardContent>

        {fetchError && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        <TableContainer>
          <Table size="small" aria-label="customers table">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "location.city"}
                    direction={sortBy === "location.city" ? sortDir : "asc"}
                    onClick={() => handleSort("location.city")}
                  >
                    City
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "location.country"}
                    direction={
                      sortBy === "location.country" ? sortDir : "asc"
                    }
                    onClick={() => handleSort("location.country")}
                  >
                    Country
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortBy === "dob.age"}
                    direction={sortBy === "dob.age" ? sortDir : "asc"}
                    onClick={() => handleSort("dob.age")}
                  >
                    Age
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "registered.date"}
                    direction={
                      sortBy === "registered.date" ? sortDir : "asc"
                    }
                    onClick={() => handleSort("registered.date")}
                  >
                    Registered
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Gender</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton width={120} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Skeleton width={160} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={30} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={90} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={60} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={60} />
                      </TableCell>
                    </TableRow>
                  ))
                : users.map((user) => (
                    <TableRow key={user.login.uuid} hover>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Avatar
                            src={user.picture.thumbnail}
                            alt={`${user.name.first} ${user.name.last}`}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              lineHeight={1.2}
                            >
                              {user.name.title} {user.name.first}{" "}
                              {user.name.last}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              @{user.login.username}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>{user.location.city}</TableCell>
                      <TableCell>{user.location.country}</TableCell>
                      <TableCell align="right">{user.dob.age}</TableCell>
                      <TableCell>{formatDate(user.registered.date)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            user.gender.charAt(0).toUpperCase() +
                            user.gender.slice(1)
                          }
                          size="small"
                          color={
                            user.gender === "male" ? "info" : "secondary"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <IconButton
                            size="small"
                            aria-label={`Edit ${user.name.first} ${user.name.last}`}
                            onClick={() => handleEditOpen(user)}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label={`Delete ${user.name.first} ${user.name.last}`}
                            color="error"
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <EditUserModal
        user={editUser}
        open={editOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </Box>
  );
}
