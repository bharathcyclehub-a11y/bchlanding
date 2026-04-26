import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login with Firebase Auth
      const result = await login(credentials.email, credentials.password);

      if (result.success) {
        // Call onLogin callback to notify parent component
        if (onLogin) {
          onLogin();
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark to-dark-light px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[20px] shadow-2xl p-8 border-t-6 border-primary">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>

            <h2 className="font-display text-3xl sm:text-4xl font-normal text-dark mb-2 uppercase tracking-wider">
              Admin Login
            </h2>
            <p className="text-gray-text text-sm">
              Access your CRM dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-[20px] bg-gray-bg border-2 border-dark/10 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none text-dark placeholder-gray-text transition-all duration-300"
                placeholder="admin@bch.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-[20px] bg-gray-bg border-2 border-dark/10 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none text-dark placeholder-gray-text transition-all duration-300"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-[20px] bg-red-50 border border-red-200"
              >
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !credentials.email || !credentials.password}
              className={`
                w-full py-4 rounded-[50px] font-bold text-lg transition-all duration-300 shadow-lg uppercase tracking-wide
                ${loading || !credentials.email || !credentials.password
                  ? 'bg-dark/10 text-gray-text cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl'
                }
              `}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>

            {/* Help text */}
            <div className="text-center text-sm text-gray-text">
              <p>Use your Firebase admin account credentials</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
