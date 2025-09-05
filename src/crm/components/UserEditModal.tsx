import * as React from "react";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { User, UpdateUserRequest, usersApi } from "../services/usersApi";

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated?: (updatedUser: User) => void;
}

interface FormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cell: string;
  city: string;
  state: string;
  country: string;
}

const titleOptions = ["Mr", "Mrs", "Ms", "Miss", "Dr"];

export default function UserEditModal({ open, user, onClose, onUserUpdated }: UserEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cell: "",
    city: "",
    state: "",
    country: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormData>>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        title: user.name.title || "",
        firstName: user.name.first || "",
        lastName: user.name.last || "",
        email: user.email || "",
        phone: user.phone || "",
        cell: user.cell || "",
        city: user.location.city || "",
        state: user.location.state || "",
        country: user.location.country || "",
      });
      setError(null);
      setFieldErrors({});
    }
  }, [user]);

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSelectChange = (field: keyof FormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!user || !validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: UpdateUserRequest = {
        name: {
          title: formData.title,
          first: formData.firstName,
          last: formData.lastName,
        },
        email: formData.email,
        phone: formData.phone,
        cell: formData.cell,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
      };

      await usersApi.updateUser(user.login.uuid, updateData);
      
      // Fetch updated user data
      const updatedUser = await usersApi.getUser(user.login.uuid);
      
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <DialogTitle>Edit Customer</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Title</InputLabel>
              <Select
                value={formData.title}
                onChange={handleSelectChange("title")}
                label="Title"
              >
                {titleOptions.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              size="small"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange("firstName")}
              error={!!fieldErrors.firstName}
              helperText={fieldErrors.firstName}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              size="small"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange("lastName")}
              error={!!fieldErrors.lastName}
              helperText={fieldErrors.lastName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              size="small"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Cell Phone"
              value={formData.cell}
              onChange={handleInputChange("cell")}
              error={!!fieldErrors.cell}
              helperText={fieldErrors.cell}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="City"
              value={formData.city}
              onChange={handleInputChange("city")}
              error={!!fieldErrors.city}
              helperText={fieldErrors.city}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="State/Province"
              value={formData.state}
              onChange={handleInputChange("state")}
              error={!!fieldErrors.state}
              helperText={fieldErrors.state}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Country"
              value={formData.country}
              onChange={handleInputChange("country")}
              error={!!fieldErrors.country}
              helperText={fieldErrors.country}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
