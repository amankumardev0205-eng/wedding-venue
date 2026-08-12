import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerStart, registerSuccess, registerFailure } from '../redux/authSlice';
import { authAPI } from '../utils/api';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { User, Mail, Lock, Sparkles } from 'lucide-react';
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'organizer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onSubmit = async (data) => {
    dispatch(registerStart());
    try {
      const { confirmPassword, ...submitData } = data;
      const response = await authAPI.register(submitData);
      dispatch(registerSuccess(response.data));
      navigate('/');
    } catch (err) {
      dispatch(registerFailure(err.response?.data?.message || 'Registration failed'));
    }
  };

  const handleGoogleSignIn = async () => {
    dispatch(registerStart());
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      
      const response = await authAPI.googleLogin(idToken);
      dispatch(registerSuccess(response.data));
      navigate('/');
    } catch (err) {
      dispatch(registerFailure(err.response?.data?.message || getGoogleSignInMessage(err)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row items-center">
        <section className="hidden md:flex md:w-1/2 bg-slate-900 p-12 text-white">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Create a new account</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight">Your wedding planning journey starts here.</h1>
              <p className="mt-4 max-w-md text-slate-300/80">Register as a customer or organizer and unlock powerful venue search, messaging, and event tools.</p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl bg-white/5 p-5 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                  <Sparkles className="h-5 w-5" /> Instant onboarding
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300/80">Sign up fast with email or Google and start browsing venues right away.</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                  <User className="h-5 w-5" /> Organizer support
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300/80">Manage venue details, inquiries, and bookings from a polished dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-200">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-200/60">
                R
              </div>
              <h2 className="text-3xl font-semibold">Create your account</h2>
              <p className="mt-2 text-sm text-slate-500">Join WedVenue now and level up your venue planning experience.</p>
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
              <span className="bg-white px-3">Or register manually</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Your full name"
                />
                {errors.name && <p className="mt-2 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email address</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account type</label>
                <select
                  {...register('role')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none cursor-pointer"
                >
                  <option value="customer">Customer</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Create a password"
                />
                {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Confirm password</label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && <p className="mt-2 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/50 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <div className="mt-8 rounded-3xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              Already registered? <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700">Sign in</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
