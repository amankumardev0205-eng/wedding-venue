import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { authAPI } from '../utils/api';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Mail, Lock, ShieldCheck, Heart } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

// UI components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const getGoogleSignInMessage = (error) => {
  switch (error?.code) {
    case 'auth/unauthorized-domain':
      return 'Google sign in is not enabled for this app address. Open http://localhost:5173 or add this domain in Firebase Authentication.';
    case 'auth/popup-closed-by-user':
      return 'Google sign in was closed before it finished.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign in popup. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'Google sign in is not enabled in Firebase Authentication.';
    default:
      return error?.message || 'Google sign in failed. Please try again.';
  }
};

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth || { isLoading: false, error: null });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const response = await authAPI.login(data);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  const handleGoogleSignIn = async () => {
    dispatch(loginStart());
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      
      const response = await authAPI.googleLogin(idToken);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || getGoogleSignInMessage(err)));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-slate)] text-[var(--text-body)] flex select-none">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row items-stretch">
        
        {/* Left Column: Premium Editorial panel (Desktop only) */}
        <section className="hidden md:flex md:w-1/2 bg-stone-900 dark:bg-stone-950 p-12 text-white flex-col justify-between relative overflow-hidden border-r border-stone-850">
          {/* Subtle branding details */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-serif font-bold text-lg select-none">
              W
            </div>
            <span className="font-serif text-lg font-bold tracking-wider uppercase">WedVenue</span>
          </div>

          <div className="relative z-10 my-auto max-w-md space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">Discover & Compare</span>
              <h1 className="mt-3 font-serif text-4xl font-extrabold leading-tight tracking-wide">
                Find the perfect wedding venue.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                Log in to shortlist your favorites, send direct inquiries, and manage your wedding bookings from one clean dashboard.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex gap-3 items-start bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">Secure Access</h3>
                  <p className="text-xs text-stone-300 mt-1 leading-normal">Fast login and secure session validation for users and coordinators alike.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">Shortlisted Collections</h3>
                  <p className="text-xs text-stone-300 mt-1 leading-normal">Instantly save, compare, and coordinate availability choices.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-stone-400 font-semibold select-none">
            © {new Date().getFullYear()} WedVenue app. All rights reserved.
          </div>
        </section>

        {/* Right Column: Authentication Card Form */}
        <section className="flex w-full md:w-1/2 items-center justify-center p-6 md:p-12">
          <Card className="w-full max-w-md bg-white dark:bg-[#1A1618] border border-[var(--border-medium)] rounded-3xl p-6 md:p-8 shadow-sm">
            <CardContent className="p-0">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm select-none">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[var(--text-dark)] leading-snug">Welcome back</h2>
                <p className="mt-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  Continue planning and discovering premium wedding venues.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/10 px-4 py-3 text-xs font-semibold text-red-700 dark:text-red-400 select-text">
                  {error}
                </div>
              )}

              {/* Social Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="mb-5 w-full flex items-center justify-center gap-2 border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold"
                leftIcon={<SiGoogle size={14} className="text-red-500" />}
              >
                Continue with Google
              </Button>

              <div className="relative mb-5 text-center text-[10px] uppercase tracking-widest text-[var(--text-muted)] select-none">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--border-light)]" />
                </div>
                <span className="relative bg-white dark:bg-[#1A1618] px-3 font-bold">Or sign in with email</span>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={15} className="text-[var(--text-muted)]" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Your secure password"
                  leftIcon={<Lock size={15} className="text-[var(--text-muted)]" />}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between gap-4 select-none">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="h-3.5 w-3.5 rounded border-stone-300 text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 accent-primary" 
                    />
                    <span>Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full py-3 font-bold shadow-sm"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs font-semibold text-[var(--text-muted)] border-t border-[var(--border-light)] pt-4 select-none">
                New to WedVenue?{' '}
                <Link to="/register" className="font-bold text-primary hover:underline">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
        
      </div>
    </div>
  );
}
