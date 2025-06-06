import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Select, Card, Heading, Text } from "@radix-ui/themes";
import { toast } from "sonner";
import { getAllUsers } from "../utils/api";

function UserSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for navigation state
    if (location.state?.loggedOut) {
      toast.success("You have been logged out successfully");
    } else if (location.state?.sessionExpired) {
      toast.error("Your session has expired. Please select a user to continue.");
    }
    
    fetchUsers();
  }, [location.state]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setLoading(false);
    }
  };

  const handleUserSelect = () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    const user = users.find(u => u.id === selectedUser);
    if (user) {
      // Store user info in localStorage
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      
      toast.success(`Welcome, ${user.name}!`);
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Text>Loading users...</Text>
      </div>
    );
  }

  return (
    <div className="dotted flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <Heading size="6" className="mb-6 text-center">
          Select User to Continue
        </Heading>
        
        <div className="space-y-4">
          <div>
            <Text size="2" className="mb-2 block">
              Choose a user account:
            </Text>
            <Select.Root value={selectedUser} onValueChange={setSelectedUser}>
              <Select.Trigger placeholder="Select a user..." className="w-full" />
              <Select.Content>
                {users.map((user) => (
                  <Select.Item key={user.id} value={user.id}>
                    {user.name} - {user.role} ({user.email})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <Button 
            color="iris" 
            size="3" 
            className="w-full"
            onClick={handleUserSelect}
            disabled={!selectedUser}
          >
            Continue as Selected User
          </Button>

          <div className="mt-4 text-center text-sm text-gray-600">
            <Text>
              This is a development/demo environment without authentication.
              Select any user to explore the system.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UserSelection;