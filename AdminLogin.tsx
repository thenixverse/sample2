import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { requireSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { FormAlert } from '@/components/enquiry/FormFeedback';
import { Logo } from '@/components/layout/Navbar';
import { validateEmail } from '@/utils/validation';

export default function AdminLogin({ onSignedIn }: { onSignedIn: () => Promise<void> }) {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requireSupabase()
      .rpc('admin_setup_required')
      .then(({ data, error: err }) => {
        if (err) console.error('setup check failed', err);
        setSetupRequired(data === true);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (validateEmail(email, true)) return setError('Enter a valid email address.');
    if (password.length < (setupRequired ? 10 : 1)) return setError(setupRequired ? 'Use a password of at least 10 characters.' : 'Enter your password.');
    if (setupRequired && password !== confirm) return setError('Passwords do not match.');

    setBusy(true);
    const db = requireSupabase();
    try {
      if (setupRequired) {
        const { data, error: signUpError } = await db.auth.signUp({ email: email.trim(), password });
        if (signUpError || !data.session) {
          console.error('admin signup failed', signUpError);
          setError('Could not create the admin account. If this email is already registered, sign in instead.');
          return;
        }
        const { data: claimed, error: claimError } = await db.rpc('claim_first_admin');
        if (claimError || claimed !== true) {
          console.error('admin claim failed', claimError);
          await db.auth.signOut();
          setSetupRequired(false);
          setError('An administrator has already been set up. Please sign in with the admin account.');
          return;
        }
      } else {
        const { error: signInError } = await db.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          console.error('admin sign in failed', signInError);
          setError('Incorrect email or password.');
          return;
        }
      }
      await onSignedIn();
    } catch (cause) {
      console.error('admin auth failed', cause);
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blood-500/10 blur-[120px]" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center"><Logo /></div>
        <div className="mt-10 rounded-xl border border-white/10 bg-ink-700 p-8 shadow-2xl">
          {setupRequired === null ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blood-500/10 text-blood-500">
                {setupRequired ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
              </span>
              <h1 className="mt-6 font-display text-4xl uppercase tracking-wide">{setupRequired ? 'Set up admin' : 'Admin sign in'}</h1>
              <p className="mt-2 text-sm text-muted">
                {setupRequired
                  ? 'No administrator exists yet. Create the owner account now. Only the first account created here becomes the administrator.'
                  : 'Sign in to manage enquiries, memberships and website content.'}
              </p>
              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <TextField id="a-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField id="a-pass" label="Password" type="password" autoComplete={setupRequired ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                {setupRequired && (
                  <TextField id="a-confirm" label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                )}
                {error && <FormAlert message={error} />}
                <Button type="submit" size="lg" disabled={busy} className="w-full">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {setupRequired ? 'Create admin account' : 'Sign in'}
                </Button>
              </form>
            </>
          )}
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-zinc-500 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </Link>
      </div>
    </main>
  );
}
