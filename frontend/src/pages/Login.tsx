import { useEffect, useState } from 'react';
import { useAuth } from '../state/auth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, CircularProgress, Container, TextField, Typography } from '@mui/material';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { user, login, restore } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) restore();
  }, []);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 12 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>MRMS Login</Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={submitting}
              sx={{ mt: 2 }}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Signing in...' : 'Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
