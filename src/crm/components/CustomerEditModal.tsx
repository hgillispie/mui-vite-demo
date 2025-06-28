import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Typography,
  Avatar,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { Customer, CustomerUpdateData } from "../types/Customer";

interface CustomerEditModalProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (id: string, data: CustomerUpdateData) => Promise<boolean>;
  loading?: boolean;
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function CustomerEditModal({
  open,
  customer,
  onClose,
  onSave,
  loading = false,
}: CustomerEditModalProps) {
  const [formData, setFormData] = React.useState<CustomerUpdateData>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: {
          title: customer.name.title,
          first: customer.name.first,
          last: customer.name.last,
        },
        location: {
          street: {
            number: customer.location.street.number,
            name: customer.location.street.name,
          },
          city: customer.location.city,
          state: customer.location.state,
          country: customer.location.country,
          postcode: customer.location.postcode,
        },
        email: customer.email,
        phone: customer.phone,
        cell: customer.cell,
        gender: customer.gender,
      });
      setError(null);
    }
  }, [customer]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (field.includes(".")) {
        const [parent, child, grandchild] = field.split(".");
        if (grandchild) {
          // Handle nested objects like location.street.name
          if (!newData[parent as keyof CustomerUpdateData]) {
            (newData as any)[parent] = {};
          }
          if (!(newData as any)[parent][child]) {
            (newData as any)[parent][child] = {};
          }
          (newData as any)[parent][child][grandchild] = value;
        } else {
          // Handle nested objects like name.first
          if (!newData[parent as keyof CustomerUpdateData]) {
            (newData as any)[parent] = {};
          }
          (newData as any)[parent][child] = value;
        }
      } else {
        // Handle direct fields
        (newData as any)[field] = value;
      }

      return newData;
    });
  };

  const handleSave = async () => {
    if (!customer) return;

    setSaving(true);
    setError(null);

    try {
      const success = await onSave(customer.login.uuid, formData);
      if (success) {
        onClose();
      } else {
        setError("Failed to save customer data");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while saving",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!customer) return null;

  const fullName = `${customer.name.first} ${customer.name.last}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={customer.picture.thumbnail}
            alt={fullName}
            sx={{ width: 40, height: 40 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Edit Customer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fullName}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ color: "grey.400" }}
            disabled={saving}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Title"
              value={formData.name?.title || ""}
              onChange={(e) => handleInputChange("name.title", e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.name?.first || ""}
              onChange={(e) => handleInputChange("name.first", e.target.value)}
              size="small"
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.name?.last || ""}
              onChange={(e) => handleInputChange("name.last", e.target.value)}
              size="small"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              size="small"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Gender"
              value={formData.gender || ""}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              size="small"
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Contact Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cell"
              value={formData.cell || ""}
              onChange={(e) => handleInputChange("cell", e.target.value)}
              size="small"
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Address Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Street Number"
              type="number"
              value={formData.location?.street?.number || ""}
              onChange={(e) =>
                handleInputChange(
                  "location.street.number",
                  parseInt(e.target.value) || 0,
                )
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Street Name"
              value={formData.location?.street?.name || ""}
              onChange={(e) =>
                handleInputChange("location.street.name", e.target.value)
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.location?.city || ""}
              onChange={(e) =>
                handleInputChange("location.city", e.target.value)
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={formData.location?.state || ""}
              onChange={(e) =>
                handleInputChange("location.state", e.target.value)
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.location?.country || ""}
              onChange={(e) =>
                handleInputChange("location.country", e.target.value)
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postcode"
              value={formData.location?.postcode || ""}
              onChange={(e) =>
                handleInputChange("location.postcode", e.target.value)
              }
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} variant="outlined" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
