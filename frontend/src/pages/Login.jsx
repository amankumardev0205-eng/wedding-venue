import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import { authAPI } from '../utils/api';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

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
  const { isLoading, error } = useSelector((state) => state.auth);

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
      const user = result.user;
      const token = await user.getIdToken();
      dispatch(loginSuccess({ user: {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
        provider: 'google',
      }, token }));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(getGoogleSignInMessage(err)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row items-center">
        <section className="hidden md:flex md:w-1/2 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-12 text-white">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/10 p-6 shadow-xl shadow-violet-500/20 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.35em] text-violet-100">Welcome to WedVenue</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight">Find the perfect venue with confidence.</h1>
              <p className="mt-4 max-w-md text-slate-100/90">Log in quickly, browse venue collections, and manage bookings with the modern wedding planning experience.</p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-100/80">
                  <ShieldCheck className="h-5 w-5" /> Secure authentication
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100/85">Fast login and secure session handling for every customer and organizer.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-100/80">
                  <Mail className="h-5 w-5" /> Easy account access
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100/85">Use email or Google to join instantly and start managing wedding venues.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-200">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-200/60">
                W
              </div>
              <h2 className="text-3xl font-semibold">Sign in to your account</h2>
              <p className="mt-2 text-sm text-slate-500">New here? <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-700">Create an account</Link></p>
            </div>

            {error && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <SiGoogle className="h-5 w-5 text-red-500" />
              Continue with Google
            </button>

            <div className="relative mb-6 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="bg-white px-3">Or continue with email</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-violet-500">
                <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <Mail className="h-4 w-4" /> Email address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-violet-500">
                <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <Lock className="h-4 w-4" /> Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Your secure password"
                />
                {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-violet-600 hover:text-violet-700">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/50 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 rounded-3xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              New to WedVenue? <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700">Create account</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
