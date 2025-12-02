import * as React from "react";
import Box from "@mui/material/Box";
import CustomersTable from "../components/CustomersTable";
import UserEditModal from "../components/UserEditModal";

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

export default function Customers() {
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (user: User) => {
    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${user.login.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            phone: user.phone,
            cell: user.cell,
            location: user.location,
            gender: user.gender,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <CustomersTable onEditUser={handleEditUser} />
      <UserEditModal
        open={modalOpen}
        user={editingUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </Box>
  );
}
