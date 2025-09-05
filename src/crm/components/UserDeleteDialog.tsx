/**
 * UserDeleteDialog Component
 * 
 * A confirmation dialog component for safely deleting user records from the system.
 * This component provides a user-friendly interface with proper error handling,
 * loading states, and confirmation messaging to prevent accidental deletions.
 * 
 * Features:
 * - Confirmation dialog with user's full name display
 * - Loading states during API calls
 * - Error handling with user-friendly messages
 * - Prevents accidental closure during deletion process
 * - Callbacks for successful deletion to update parent components
 */

import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { User, usersApi } from "../services/usersApi";

/**
 * Props interface for the UserDeleteDialog component
 * 
 * @interface UserDeleteDialogProps
 * @param {boolean} open - Controls the visibility of the dialog
 * @param {User | null} user - The user object to be deleted, or null if no user selected
 * @param {() => void} onClose - Callback function called when dialog should close
 * @param {(deletedUser: User) => void} [onUserDeleted] - Optional callback called after successful deletion
 */
interface UserDeleteDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserDeleted?: (deletedUser: User) => void;
}

/**
 * UserDeleteDialog Component
 * 
 * Renders a confirmation dialog for user deletion with proper error handling
 * and loading states to ensure a safe and user-friendly deletion process.
 * 
 * @param {UserDeleteDialogProps} props - Component props
 * @returns {JSX.Element | null} The dialog component or null if no user provided
 */
export default function UserDeleteDialog({ 
  open, 
  user, 
  onClose, 
  onUserDeleted 
}: UserDeleteDialogProps) {
  // Loading state to track deletion API call progress
  const [loading, setLoading] = useState(false);
  
  // Error state to display any deletion failures to the user
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the user deletion process
   * 
   * This function manages the entire deletion workflow:
   * 1. Validates that a user is selected
   * 2. Sets loading state to prevent multiple submissions
   * 3. Calls the API to delete the user
   * 4. Notifies parent component of successful deletion
   * 5. Closes the dialog
   * 6. Handles any errors that occur during the process
   * 
   * @async
   * @function handleDelete
   * @returns {Promise<void>}
   */
  const handleDelete = async () => {
    // Early return if no user is selected (safety check)
    if (!user) return;

    // Set loading state to show progress and prevent duplicate requests
    setLoading(true);
    
    // Clear any previous error messages
    setError(null);

    try {
      // Call the API to delete the user using their unique identifier
      await usersApi.deleteUser(user.login.uuid);
      
      // Notify parent component that user was successfully deleted
      // This allows the parent to update its state (e.g., refresh data grid)
      if (onUserDeleted) {
        onUserDeleted(user);
      }
      
      // Close the dialog after successful deletion
      onClose();
    } catch (err) {
      // Handle any errors that occurred during deletion
      // Convert error to user-friendly message
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to delete user";
      setError(errorMessage);
    } finally {
      // Always reset loading state, regardless of success or failure
      setLoading(false);
    }
  };

  /**
   * Handles dialog close events
   * 
   * Prevents the dialog from closing while a deletion is in progress
   * to avoid leaving the system in an inconsistent state.
   * 
   * @function handleClose
   * @returns {void}
   */
  const handleClose = () => {
    // Only allow closing if not currently deleting
    if (!loading) {
      onClose();
    }
  };

  /**
   * Early return if no user is provided
   * 
   * This prevents the dialog from rendering with empty/invalid data
   * and serves as a safety mechanism for the component.
   */
  if (!user) {
    return null;
  }

  // Construct the user's full name for display in the confirmation message
  const userName = `${user.name.first} ${user.name.last}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Dialog Title - Clear indication of the destructive action */}
      <DialogTitle>Delete Customer</DialogTitle>
      
      <DialogContent>
        {/* Error Alert - Only shown when an error occurs during deletion */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Confirmation Message - Clearly states the action and its permanence */}
        <DialogContentText>
          Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      
      {/* Action Buttons - Cancel and Delete options */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {/* Cancel Button - Allows user to abort the deletion */}
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        
        {/* Delete Button - Performs the destructive action */}
        <Button 
          onClick={handleDelete}
          variant="contained"
          color="error"  // Red color to indicate destructive action
          disabled={loading}  // Prevent multiple clicks during deletion
          startIcon={loading ? <CircularProgress size={16} /> : null}  // Show loading spinner
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
