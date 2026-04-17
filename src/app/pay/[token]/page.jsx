'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PaymentBridgePage() {
    const params = useParams();
    const token = params.token;
    const [status, setStatus] = useState('initializing'); // initializing, redirecting, error

    useEffect(() => {
        if (!token) return;

        const initiatePayment = async () => {
            console.log('[PAY PAGE] Token:', token);
            console.log('[PAY PAGE] Calling backend...');
            setStatus('redirecting');

            try {
                // The backend GET endpoint redirects automatically via 302
                // So we can simply set window.location.href
                const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/pay/${token}`;
                window.location.href = backendUrl;
            } catch (error) {
                console.error('[PAY PAGE] Redirection failed:', error);
                setStatus('error');
            }
        };

        initiatePayment();
    }, [token]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            padding: '20px'
        }}>
            {status === 'redirecting' && (
                <>
                    <div className="loader" style={{
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }}></div>
                    <h2 style={{ color: '#333', marginBottom: '10px' }}>Redirecting to secure payment...</h2>
                    <p style={{ color: '#666' }}>Please do not close this window or press the back button.</p>
                </>
            )}

            {status === 'error' && (
                <>
                    <div style={{ color: '#e74c3c', fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                    <h2 style={{ color: '#333', marginBottom: '10px' }}>Payment session expired.</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Please go back to the app and try again.</p>
                    <button 
                        onClick={() => window.close()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Close Window
                    </button>
                </>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
