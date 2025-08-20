import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
    // This runs on server automatically
    redirect('/login/forgot-password');
}
