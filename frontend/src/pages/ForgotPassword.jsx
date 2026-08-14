import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../utils/api';

// UI components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage('');
    setIsError(false);
    try {
      await authAPI.forgotPassword(data.email);
      setMessage('If an account exists for that email, a reset link has been sent.');
      setIsError(false);
    } catch (error) {
      setMessage('Failed to send reset link. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-slate)] p-6 select-none">
      <Card className="w-full max-w-md bg-white dark:bg-[#1A1618] border border-[var(--border-medium)] rounded-3xl p-6 md:p-8 shadow-sm">
        <CardContent className="p-0">
          
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[var(--text-dark)] leading-snug">Forgot Password</h1>
            <p className="mt-1.5 text-xs font-semibold text-[var(--text-muted)]">
              Enter your email to receive a password reset link.
            </p>
          </div>

          {message && (
            <div className={`mb-5 p-3 rounded-xl border text-xs font-semibold select-text ${
              isError 
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/10 dark:border-red-900/30 dark:text-red-400' 
                : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/10 dark:border-green-900/30 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={15} className="text-[var(--text-muted)]" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-3 font-bold shadow-sm"
            >
              {isLoading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs font-semibold text-[var(--text-muted)] border-t border-[var(--border-light)] pt-4">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
            >
              <ArrowLeft size={13} />
              <span>Back to Login</span>
            </Link>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
