import React, { useState, useEffect } from 'react';

function DebugAuth() {
    const [tokenInfo, setTokenInfo] = useState(null);
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const user = localStorage.getItem('user');

        if (!token) {
            setTokenInfo({ error: 'No token found in localStorage' });
            return;
        }

        try {
            // Decode JWT token
            const parts = token.split('.');
            if (parts.length !== 3) {
                setTokenInfo({ error: 'Invalid token format' });
                return;
            }

            const payload = JSON.parse(atob(parts[1]));
            const now = Date.now() / 1000;
            const isExpired = payload.exp < now;

            setTokenInfo({
                token: token.substring(0, 20) + '...',
                userId,
                user: user ? JSON.parse(user) : null,
                payload,
                isExpired,
                expiresIn: isExpired ? 'EXPIRED' : `${Math.round((payload.exp - now) / 3600)} hours`,
                expiresAt: new Date(payload.exp * 1000).toLocaleString()
            });
        } catch (error) {
            setTokenInfo({ error: 'Failed to decode token: ' + error.message });
        }
    };

    const testAPI = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setTestResult({ error: 'No token to test' });
            return;
        }

        setTestResult({ loading: true });

        try {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            setTestResult({
                status: response.status,
                ok: response.ok,
                data: data,
                headers: Object.fromEntries(response.headers.entries())
            });
        } catch (error) {
            setTestResult({ error: error.message });
        }
    };

    const clearAndReload = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#1e1e2e',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 9999,
            border: '2px solid #6c5ce7',
            fontSize: '12px',
            fontFamily: 'monospace'
        }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#6c5ce7' }}>🔍 Auth Debug Panel</h3>

            <button
                onClick={checkToken}
                style={{
                    padding: '8px 16px',
                    background: '#6c5ce7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '10px'
                }}
            >
                🔄 Refresh
            </button>

            <button
                onClick={testAPI}
                style={{
                    padding: '8px 16px',
                    background: '#00b894',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '10px'
                }}
            >
                🧪 Test API
            </button>

            <button
                onClick={clearAndReload}
                style={{
                    padding: '8px 16px',
                    background: '#d63031',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                🗑️ Clear & Reload
            </button>

            <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#a29bfe', marginBottom: '10px' }}>📦 LocalStorage:</h4>
                {tokenInfo ? (
                    <pre style={{
                        background: '#2a2a3e',
                        padding: '10px',
                        borderRadius: '6px',
                        overflow: 'auto',
                        maxHeight: '200px'
                    }}>
                        {JSON.stringify(tokenInfo, null, 2)}
                    </pre>
                ) : (
                    <p style={{ color: '#fdcb6e' }}>Loading...</p>
                )}

                {tokenInfo?.error && (
                    <div style={{
                        background: '#d63031',
                        padding: '10px',
                        borderRadius: '6px',
                        marginTop: '10px'
                    }}>
                        ❌ {tokenInfo.error}
                    </div>
                )}

                {tokenInfo?.isExpired && (
                    <div style={{
                        background: '#d63031',
                        padding: '10px',
                        borderRadius: '6px',
                        marginTop: '10px'
                    }}>
                        ⚠️ TOKEN EXPIRED! Please login again.
                    </div>
                )}
            </div>

            {testResult && (
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ color: '#a29bfe', marginBottom: '10px' }}>🧪 API Test Result:</h4>
                    <pre style={{
                        background: '#2a2a3e',
                        padding: '10px',
                        borderRadius: '6px',
                        overflow: 'auto',
                        maxHeight: '200px'
                    }}>
                        {JSON.stringify(testResult, null, 2)}
                    </pre>

                    {testResult.status === 401 && (
                        <div style={{
                            background: '#d63031',
                            padding: '10px',
                            borderRadius: '6px',
                            marginTop: '10px'
                        }}>
                            ❌ 401 Unauthorized<br />
                            Check if token is valid and not expired.
                        </div>
                    )}

                    {testResult.status === 200 && (
                        <div style={{
                            background: '#00b894',
                            padding: '10px',
                            borderRadius: '6px',
                            marginTop: '10px'
                        }}>
                            ✅ API Working! Auth is OK.
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '11px', color: '#b4b4c8' }}>
                <strong>Common Issues:</strong>
                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                    <li>No token → Login again</li>
                    <li>Token expired → Login again</li>
                    <li>Invalid token → Clear storage & login</li>
                    <li>401 error → Check backend auth middleware</li>
                </ul>
            </div>
        </div>
    );
}

export default DebugAuth;