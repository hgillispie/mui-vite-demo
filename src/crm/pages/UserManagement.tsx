/**
 * UserManagement Component
 * 
 * This component provides a comprehensive user management interface for the CRM system.
 * It displays a paginated, searchable, and sortable table of users fetched from the
 * internal Users API (https://user-api.builder-io.workers.dev/api/users).
 * 
 * Features:
 * - Search users by name, email, or city
 * - Sort users by multiple attributes (name, location, age, registration date)
 * - Select individual or all users via checkboxes
 * - Pagination with configurable rows per page
 * - Display user status (Active/Suspended) based on registration age
 * - Show user avatars and location information
 * 
 * @component
 */

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

/**
 * User interface representing the structure of a user object
 * as returned from the Users API
 */
interface User {
  /** User login credentials and identification */
  login: {
    /** Unique user identifier */
    uuid: string;
    /** User's username for authentication */
    username: string;
  };
  /** User's personal name information */
  name: {
    /** Title (Mr, Mrs, Ms, etc.) */
    title: string;
    /** First name */
    first: string;
    /** Last name */
    last: string;
  };
  /** User's email address */
  email: string;
  /** User's geographical location details */
  location: {
    /** City of residence */
    city: string;
    /** State/Province */
    state: string;
    /** Country */
    country: string;
  };
  /** Optional user profile pictures in various sizes */
  picture?: {
    /** Small thumbnail image URL */
    thumbnail: string;
    /** Medium-sized image URL */
    medium: string;
    /** Large/full-size image URL */
    large: string;
  };
  /** Optional registration information */
  registered?: {
    /** ISO date string of when the user registered */
    date: string;
    /** Account age in years */
    age: number;
  };
}

/**
 * API response structure for the users endpoint
 */
interface UsersResponse {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of results per page */
  perPage: number;
  /** Total number of users matching the query */
  total: number;
  /** Array of user objects for the current page */
  data: User[];
}

/**
 * UserManagement functional component
 * Renders the main user management interface with table, search, and pagination
 */
export default function UserManagement() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  /** Array of users displayed in the current table view */
  const [users, setUsers] = React.useState<User[]>([]);
  
  /** Array of selected user UUIDs for bulk operations */
  const [selected, setSelected] = React.useState<string[]>([]);
  
  /** Current page index (0-indexed for MUI TablePagination) */
  const [page, setPage] = React.useState(0);
  
  /** Number of rows to display per page */
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  /** Total count of users matching current search/filter criteria */
  const [total, setTotal] = React.useState(0);
  
  /** Search query string for filtering users */
  const [searchQuery, setSearchQuery] = React.useState("");
  
  /** Attribute to sort users by (e.g., "name.first", "location.city") */
  const [sortAttribute, setSortAttribute] = React.useState("name.first");
  
  /** Loading state to show spinner/loading indicator during API calls */
  const [loading, setLoading] = React.useState(false);

  // ============================================================================
  // API Integration
  // ============================================================================
  
  /**
   * Fetches users from the Users API based on current state
   * 
   * This function constructs query parameters from the current state and makes
   * a GET request to the users endpoint. It handles pagination, search, and sorting.
   * 
   * The function is memoized with useCallback to prevent unnecessary re-renders
   * and includes all dependencies that affect the API call.
   */
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters for the API request
      const params = new URLSearchParams({
        page: (page + 1).toString(), // API uses 1-indexed pages
        perPage: rowsPerPage.toString(),
        sortBy: sortAttribute,
      });

      // Add search parameter only if user has entered a search query
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      // Make the API request
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`
      );
      const data: UsersResponse = await response.json();
      
      // Update state with fetched data, using empty array as fallback
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      // Log error and reset users to prevent stale data display
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      // Always set loading to false, even if request fails
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, sortAttribute]);

  /**
   * Effect hook to fetch users whenever pagination, search, or sort changes
   * 
   * This ensures the table data stays in sync with user interactions
   */
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ============================================================================
  // Selection Handlers
  // ============================================================================
  
  /**
   * Handles the "select all" checkbox in the table header
   * 
   * When checked, selects all users on the current page.
   * When unchecked, clears all selections.
   * 
   * @param event - The checkbox change event
   */
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Select all users on current page
      const newSelected = users.map((user) => user.login.uuid);
      setSelected(newSelected);
      return;
    }
    // Clear all selections
    setSelected([]);
  };

  /**
   * Handles individual row selection/deselection
   * 
   * Implements toggle behavior - clicking a selected row deselects it,
   * clicking an unselected row selects it. This handles the complex logic
   * of adding/removing items from the selected array immutably.
   * 
   * @param id - The UUID of the user to toggle
   */
  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      // Item not selected - add it to the end
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      // Item is first - remove it by taking everything after it
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      // Item is last - remove it by taking everything before it
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      // Item is in the middle - concatenate before and after
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // ============================================================================
  // Pagination Handlers
  // ============================================================================
  
  /**
   * Handles page change in the table pagination
   * 
   * @param _event - The event object (unused)
   * @param newPage - The new page index (0-indexed)
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handles rows per page change in the table pagination
   * 
   * When the user changes how many rows to display per page,
   * we reset to the first page to avoid confusion.
   * 
   * @param event - The select change event containing the new value
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================
  
  /**
   * Checks if a user is currently selected
   * 
   * @param id - The UUID of the user to check
   * @returns true if the user is selected, false otherwise
   */
  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  /**
   * Determines and renders the appropriate status chip for a user
   * 
   * Users are considered "Suspended" if their account age is less than 2 years.
   * Otherwise, they are considered "Active".
   * 
   * @param user - The user object to get status for
   * @returns A MUI Chip component with the appropriate status and color
   */
  const getStatusChip = (user: User) => {
    // Consider accounts less than 2 years old as suspended
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

  // ============================================================================
  // Component Render
  // ============================================================================
  
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Box sx={{ py: 2 }}>
        {/* Page Title */}
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontSize: "36px", fontWeight: 600 }}>
          User management
        </Typography>

        {/* Main Content Paper Container */}
        <Paper elevation={1} sx={{ borderRadius: 1 }}>
          {/* Toolbar with Search, Filters, and Actions */}
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            {/* Left Side - Search and Filters */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              {/* Search Input */}
              <TextField
                label="Search"
                variant="outlined"
                size="medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, etc..."
                sx={{ width: 300 }}
                InputProps={{
                  sx: { justifyContent: "flex-start" }
                }}
              />

              {/* Sort Attribute Selector */}
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

              {/* Filter Icon Button (placeholder for future filter functionality) */}
              <IconButton size="medium">
                <FilterAltIcon />
              </IconButton>
            </Box>

            {/* Right Side - Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Generic Action Button (placeholder for bulk actions) */}
              <Button variant="outlined" color="inherit">
                ACTION
              </Button>
              
              {/* Create New User Button */}
              <Button variant="contained" color="primary">
                NEW
              </Button>
              
              {/* Settings Icon Button (placeholder for table settings) */}
              <IconButton size="medium">
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Users Data Table */}
          <TableContainer>
            <Table>
              {/* Table Header */}
              <TableHead>
                <TableRow>
                  {/* Select All Checkbox Column */}
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
              
              {/* Table Body */}
              <TableBody>
                {/* Loading State */}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  /* Empty State */
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  /* User Rows */
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
                        {/* Selection Checkbox */}
                        <TableCell padding="checkbox">
                          <Checkbox color="primary" checked={isItemSelected} />
                        </TableCell>
                        
                        {/* User Column - Avatar and Name */}
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
                        
                        {/* Email Column */}
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        
                        {/* Location Column - Icon and City */}
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon fontSize="small" />
                            <Typography variant="body2">
                              {user.location.city}
                            </Typography>
                          </Stack>
                        </TableCell>
                        
                        {/* Account Status Column - Status Chip */}
                        <TableCell>{getStatusChip(user)}</TableCell>
                        
                        {/* ID Column - First 8 characters of UUID */}
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

          {/* Table Pagination Controls */}
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
