import { useState } from 'react';
import { login } from '../../utils/auth';

export default function LoginForm({ onSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (await login(password)) {
            onSuccess();
        } else {
            setError('Senha incorreta');
            setPassword('');
        }

        setIsLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <img src="/logo.png" alt="Tary Moda Praia" className="login-logo" />
                    <h1 className="login-title">Área Administrativa</h1>
                    <p className="login-subtitle">Digite a senha para acessar o painel</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Senha de Acesso
                        </label>
                        <input
                            id="password"
                            type="password"
                            className={`form-input login-input ${error ? 'error' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha..."
                            autoFocus
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={isLoading || !password}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-small"></span>
                                Verificando...
                            </>
                        ) : (
                            <>
                                Entrar
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="/" className="login-back">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Voltar ao Site
                    </a>
                </div>
            </div>

            <div className="login-decoration">
                <div className="login-wave"></div>
            </div>
        </div>
    );
}
