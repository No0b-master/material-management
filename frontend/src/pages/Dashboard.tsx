import { Button, Container, Typography } from '@mui/material';
import { useAuth } from '../state/auth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>Welcome, {user?.name} ({user?.role})</Typography>
      <Button variant="outlined" onClick={logout}>Logout</Button>
    </Container>
  );
}
