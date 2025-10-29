import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface User {
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
  phone: string;
  picture: {
    thumbnail: string;
  };
}

const API_BASE = "https://user-api.builder-io.workers.dev/api";

export default function Customers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async (search: string = "") => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page + 1),
        perPage: String(rowsPerPage),
      });
      if (search) {
        params.append("search", search);
      }
      const response = await fetch(`${API_BASE}/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 300);
    return () => clearTimeout(delayTimer);
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData(JSON.parse(JSON.stringify(user)));
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !editingUser) return;
    try {
      setDeleting(true);
      const response = await fetch(
        `${API_BASE}/users/${editingUser.login.username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );
      if (!response.ok) throw new Error("Failed to update user");
      fetchUsers(searchTerm);
      handleCloseEditDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.name.first} ${user.name.last}?`))
      return;
    try {
      setDeleting(true);
      const response = await fetch(
        `${API_BASE}/users/${user.login.username}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers(searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleFormFieldChange = (
    field: string,
    value: string,
    nested?: string
  ) => {
    if (!editFormData) return;
    const updated = JSON.parse(JSON.stringify(editFormData));
    if (nested) {
      if (!updated[field]) updated[field] = {};
      updated[field][nested] = value;
    } else {
      updated[field] = value;
    }
    setEditFormData(updated);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack spacing={3}>
        <Stack>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600, fontSize: "36px", color: "rgba(144, 19, 254, 1)" }}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your customer database
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search customers by name, email, or city..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
              />

              <TableContainer>
                <Table size="small" aria-label="customers table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                          <CircularProgress size={40} />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                          <Typography color="text.secondary">
                            No customers found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user.login.uuid}
                          hover
                          sx={{ "&:last-child td": { border: 0 } }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar
                                src={user.picture.thumbnail}
                                sx={{ width: 32, height: 32 }}
                              >
                                {user.name.first.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.name.first} {user.name.last}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "primary.main" }}>
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.location.city}</TableCell>
                          <TableCell>{user.location.country}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(user)}
                              title="Edit user"
                              disabled={deleting}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete user"
                              disabled={deleting}
                              sx={{ color: "error.main" }}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={-1}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Edit User Modal */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Customer: {editingUser?.name.first} {editingUser?.name.last}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="First Name"
            value={editFormData?.name.first || ""}
            onChange={(e) =>
              handleFormFieldChange("name", e.target.value, "first")
            }
          />
          <TextField
            fullWidth
            label="Last Name"
            value={editFormData?.name.last || ""}
            onChange={(e) =>
              handleFormFieldChange("name", e.target.value, "last")
            }
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editFormData?.email || ""}
            onChange={(e) => handleFormFieldChange("email", e.target.value)}
          />
          <TextField
            fullWidth
            label="Phone"
            value={editFormData?.phone || ""}
            onChange={(e) => handleFormFieldChange("phone", e.target.value)}
          />
          <TextField
            fullWidth
            label="City"
            value={editFormData?.location.city || ""}
            onChange={(e) =>
              handleFormFieldChange("location", e.target.value, "city")
            }
          />
          <TextField
            fullWidth
            label="Country"
            value={editFormData?.location.country || ""}
            onChange={(e) =>
              handleFormFieldChange("location", e.target.value, "country")
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
