import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext'; // 👈 import context
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth(); // 👈 use context function

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await axiosInstance.post('/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            login(user); // ✅ update context with user

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#cccccc' : '#4caf50',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
