import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/api';
import Footer from '../components/Footer';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiService.auth.login(email, password);
      if (result.success) {
        console.log('Login successful:', result.data);
        navigate('/dashboard');
      } else {
        setError(result.error);
        setEmail('');
        setPassword('');
        console.error('Login failed:', result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setEmail('');
      setPassword('');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <style>{`
        .glass-card {
          background: rgba(25, 38, 51, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(50, 77, 103, 0.5);
        }
        .bg-grid {
          background-image: radial-gradient(#137fec22 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-b-[#233648] px-10 py-4 bg-white/5 dark:bg-transparent">
          <div className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined text-2xl">key_visualizer</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Config Manager</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-[#233648] text-gray-900 dark:text-white hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-xl">shield_lock</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-grid">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="w-full max-w-[440px] z-10">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-primary text-5xl">encrypted</span>
              </div>
              <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight px-4">Secure Sign In</h1>
              <p className="text-gray-600 dark:text-[#92adc9] text-base font-normal leading-normal pt-2 px-4">
                Manage environment secrets and system variables
              </p>
            </div>

            <div className="glass-card rounded-xl p-8 shadow-2xl">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-800 dark:text-white text-sm font-semibold leading-normal">Work Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#92adc9] text-xl">alternate_email</span>
                    <input 
                      className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-gray-300 dark:border-[#324d67] bg-white dark:bg-[#192633] h-12 placeholder:text-[#92adc9] pl-12 pr-4 text-base font-normal" 
                      placeholder="name@company.com" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-800 dark:text-white text-sm font-semibold leading-normal">Password</label>
                    <a className="text-primary text-xs font-semibold hover:underline" href="#">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#92adc9] text-xl">lock</span>
                    <input 
                      className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-gray-300 dark:border-[#324d67] bg-white dark:bg-[#192633] h-12 placeholder:text-[#92adc9] pl-12 pr-12 text-base font-normal" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#92adc9] hover:text-white" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  className="w-full flex items-center justify-center rounded-lg h-12 bg-primary text-white text-base font-bold tracking-wide hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
    
              </form>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-[#92adc9]">
                Don't have an account? 
                <a className="text-primary font-semibold hover:underline" href="#"> Request access</a>
              </p>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">System Secure: AES-256</span>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default LoginPage;