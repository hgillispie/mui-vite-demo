/**
 * Customers.tsx
 *
 * Full-featured Customers dashboard page for the CRM.
 *
 * Features:
 *  - Summary stat cards populated from the Users API (total, countries, avg age, new this month)
 *  - Searchable, server-side paginated and sortable customer table
 *  - Edit modal that PUTs updated fields back to the Users API
 *
 * Data source: https://user-api.builder-io.workers.dev/api/users
 */

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

/** Nested location object returned by the Users API. */
interface UserLocation {
  city: string;
  state: string;
  country: string;
  postcode: string;
  street: { number: number; name: string };
  coordinates: { latitude: number; longitude: number };
  timezone: { offset: string; description: string };
}

/**
 * Full user record as returned by GET /api/users and GET /api/users/:id.
 * All nested objects mirror the API response shape exactly so they can be
 * spread directly into PUT request bodies.
 */
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

/** Paginated response envelope from GET /api/users. */
interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

/**
 * Dot-notation field names accepted by the API's `sortBy` query parameter.
 * Only these values are valid — the API will ignore unknown sort fields.
 */
type SortField =
  | "name.first"
  | "name.last"
  | "location.city"
  | "location.country"
  | "dob.age"
  | "registered.date";

// ─── Stat Card ───────────────────────────────────────────────────────────────

/** Props for the small summary metric cards shown at the top of the page. */
interface StatCardProps {
  /** MUI icon element rendered inside the colored square. */
  icon: React.ReactNode;
  /** Human-readable metric label shown below the value. */
  label: string;
  /** Metric value — either a pre-formatted string or a raw number. */
  value: string | number;
  /**
   * MUI palette key used to tint the icon background and icon color.
   * e.g. "primary", "info", "warning", "success"
   */
  color: string;
}

/**
 * CustomerStatCard
 *
 * A compact card that displays a single KPI metric with a colored icon,
 * a prominent numeric value, and a descriptive label underneath.
 * Used in the top summary row of the Customers dashboard.
 */
function CustomerStatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Colored icon badge — background tint + icon color both derive from the `color` prop */}
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
            {/* Primary metric value */}
            <Typography variant="h5" component="p" fontWeight={600} sx={{ color: "rgba(65, 117, 5, 1)" }}>
              {value}
            </Typography>
            {/* Descriptive label */}
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

/** Props for the EditUserModal dialog. */
interface EditUserModalProps {
  /** The user record to edit, or null when the modal is closed. */
  user: User | null;
  /** Controls dialog visibility. */
  open: boolean;
  /** Called when the user dismisses the dialog without saving. */
  onClose: () => void;
  /**
   * Called with the updated user record after a successful PUT request.
   * The parent uses this to update the table row in place without re-fetching.
   */
  onSave: (user: User) => void;
}

/**
 * EditUserModal
 *
 * A full-screen-width dialog that lets staff edit a customer's personal info
 * and location. On submit it sends a PUT request to the Users API using the
 * user's UUID as the identifier, then calls `onSave` so the parent table can
 * update optimistically without a full data re-fetch.
 *
 * Form state is managed locally and seeded from the `user` prop whenever
 * the modal opens (via a useEffect dependency on `user`).
 */
function EditUserModal({ user, open, onClose, onSave }: EditUserModalProps) {
  // Local copy of the user record that the form fields mutate.
  const [formData, setFormData] = React.useState<Partial<User>>({});
  // True while the PUT request is in-flight — disables the submit button.
  const [saving, setSaving] = React.useState(false);
  // Non-null when the PUT request fails — shown as an inline Alert.
  const [error, setError] = React.useState<string | null>(null);

  // Seed formData whenever a new user is passed in (i.e. modal is opened).
  React.useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  /**
   * Returns a curried onChange handler for a given dot-notation path within
   * formData. For example, handleFieldChange("name.first") returns a handler
   * that updates formData.name.first while keeping the rest of the object intact.
   *
   * Shallow-clones each level of nesting so React detects the state change.
   */
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
        // Walk down the path, shallow-cloning each intermediate object.
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...(current[keys[i]] as object) };
          current = current[keys[i]] as Record<string, unknown>;
        }
        // Set the leaf value.
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    };

  /**
   * Submits the edited formData to PUT /api/users/:uuid.
   * On success: calls onSave (updates parent table) then closes the modal.
   * On failure: surfaces an error Alert inside the dialog.
   */
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

  /**
   * Helper to safely read a dot-notation path from formData.
   * Returns an empty string if any intermediate key is missing,
   * preventing "Cannot read property of undefined" errors in controlled inputs.
   */
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

      {/* The dialog body doubles as the <form> so the submit button inside
          DialogActions can trigger native form validation. */}
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {/* API error feedback */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* User identity summary — avatar + display name + username */}
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

          {/* ── Personal Info section ── */}
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

          {/* ── Location section ── */}
          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            sx={{ mb: 1 }}
          >
            Location
          </Typography>
          <Grid container spacing={2}>
            {/* Street is read-only combined display; only the name portion is editable */}
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
          {/* Spinner replaces the leading icon while the PUT request is in-flight */}
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

/** Rows-per-page options exposed in the table pagination control. */
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

/**
 * Customers
 *
 * Top-level page component for the /customers route.
 *
 * Responsibilities:
 *  1. Fetch paginated user data from the Users API, re-fetching whenever
 *     page, rowsPerPage, sortBy, or debouncedSearch changes.
 *  2. Derive summary KPIs from the current page of data (countries, avg age,
 *     new registrations this calendar month).
 *  3. Render four stat cards, a searchable + sortable table, and an edit modal.
 *
 * State overview:
 *  - users / total        — current page data and total record count from the API
 *  - loading / fetchError — async fetch lifecycle flags
 *  - search               — raw value bound to the search TextField (debounced before API call)
 *  - debouncedSearch      — delayed copy of search, used as the actual API query param
 *  - page / rowsPerPage   — MUI TablePagination state (0-indexed page)
 *  - sortBy / sortDir     — column sort state forwarded to the API
 *  - editUser / editOpen  — which user is being edited and whether the modal is open
 */
export default function Customers() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // ── Table / search state ─────────────────────────────────────────────────
  const [search, setSearch] = React.useState("");
  // Debounced copy of `search` — only updated after the user stops typing for 400 ms.
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(0); // MUI pagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<SortField>("name.first");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  // ── Edit modal state ─────────────────────────────────────────────────────
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  // ── Search debounce ──────────────────────────────────────────────────────
  // Waits 400 ms after the last keystroke before updating debouncedSearch,
  // which in turn triggers the API fetch effect. Also resets to page 0 so
  // search results always start from the beginning.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Data fetch ───────────────────────────────────────────────────────────
  // Re-runs whenever pagination, sort, or search changes.
  // The API page parameter is 1-indexed, so we add 1 to MUI's 0-indexed page.
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
        setTotal(json.total); // total drives TablePagination's count prop
      } catch {
        setFetchError("Could not load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, rowsPerPage, sortBy, debouncedSearch]);

  // ── Sort handler ─────────────────────────────────────────────────────────
  // Clicking an already-active column header flips the direction;
  // clicking a new column defaults to ascending and resets to page 0.
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  // ── Edit modal handlers ──────────────────────────────────────────────────
  const handleEditOpen = (user: User) => {
    setEditUser(user);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditUser(null);
  };

  /**
   * Optimistically updates the matching row in the local `users` array after
   * a successful PUT, avoiding a full re-fetch just to reflect the edit.
   */
  const handleEditSave = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.login.uuid === updated.login.uuid ? { ...u, ...updated } : u,
      ),
    );
  };

  /** Formats an ISO date string to a locale-friendly "Jan 1, 2024" format. */
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Derived stats (computed from current page of users) ──────────────────

  /** Number of distinct countries in the current page of results. */
  const uniqueCountries = React.useMemo(
    () => new Set(users.map((u) => u.location.country)).size,
    [users],
  );

  /** Mean age across users on the current page, rounded to the nearest integer. */
  const avgAge = React.useMemo(() => {
    if (!users.length) return 0;
    return Math.round(users.reduce((sum, u) => sum + u.dob.age, 0) / users.length);
  }, [users]);

  /**
   * Count of users whose registration date falls within the current calendar
   * month and year. Note: this reflects only the current page of results,
   * not the full dataset.
   */
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>

      {/* ── Page header ── */}
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

      {/* ── Summary stat cards ──
          Values are pulled from the API response; "…" is shown while loading. */}
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

      {/* ── Customer table card ── */}
      <Card variant="outlined">
        <CardContent sx={{ pb: 0 }}>
          {/* Table toolbar: title on the left, search field on the right */}
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
            {/* Controlled search input — updates `search` state on every keystroke;
                the debounce effect delays the actual API call by 400 ms. */}
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

        {/* API-level error banner (shown when the fetch itself fails) */}
        {fetchError && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        <TableContainer>
          <Table size="small" aria-label="customers table">
            <TableHead>
              <TableRow>
                {/* Non-sortable columns */}
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>

                {/* Sortable columns — each wraps its label in a TableSortLabel
                    that shows the active sort direction arrow. */}
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
                ? /* ── Skeleton rows shown while data loads ──
                     One skeleton row per rowsPerPage entry keeps layout stable. */
                  Array.from({ length: rowsPerPage }).map((_, i) => (
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
                : /* ── Data rows ── */
                  users.map((user) => (
                    <TableRow key={user.login.uuid} hover>
                      {/* Avatar + full name + username */}
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

                      {/* Gender chip — "info" for male, "secondary" for female */}
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

                      {/* Row action buttons: edit opens the modal, delete is wired up separately */}
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

        {/* Server-side pagination — `count` is the total from the API so MUI
            can correctly calculate the number of pages without loading all data. */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0); // reset to first page when page size changes
          }}
        />
      </Card>

      {/* Edit User Modal — rendered here (at page level) so it sits above the
          table in the stacking context and doesn't inherit table scroll overflow. */}
      <EditUserModal
        user={editUser}
        open={editOpen}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </Box>
  );
}
