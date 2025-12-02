import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";

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
    state: string;
    postcode: string;
    street: {
      number: number;
      name: string;
    };
  };
  phone: string;
  cell: string;
  gender: string;
}

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
}

export default function UserEditModal({
  open,
  user,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [formData, setFormData] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFormData(JSON.parse(JSON.stringify(user)));
      setError(null);
    }
  }, [user, open]);

  const handleChange = (field: string, value: string) => {
    if (!formData) return;

    const fieldParts = field.split(".");
    const updatedData = JSON.parse(JSON.stringify(formData));

    let current = updatedData;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;

    setFormData(updatedData);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while saving"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Customer</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Avatar
              src={formData.picture.thumbnail}
              sx={{ width: 80, height: 80 }}
            >
              {getInitials(formData.name.first, formData.name.last)}
            </Avatar>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.name.first}
                onChange={(e) => handleChange("name.first", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.name.last}
                onChange={(e) => handleChange("name.last", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cell"
                value={formData.cell}
                onChange={(e) => handleChange("cell", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                value={formData.location.street.name}
                onChange={(e) =>
                  handleChange("location.street.name", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.location.city}
                onChange={(e) => handleChange("location.city", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.location.state}
                onChange={(e) => handleChange("location.state", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.location.country}
                onChange={(e) =>
                  handleChange("location.country", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.location.postcode}
                onChange={(e) =>
                  handleChange("location.postcode", e.target.value)
                }
                size="small"
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {loading && <CircularProgress size={20} />}
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
