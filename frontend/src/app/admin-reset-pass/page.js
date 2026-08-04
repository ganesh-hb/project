import AdminResetPassword from "@/components/user/AdminResetPassword";
import { Suspense } from "react";
export default function AdminResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <AdminResetPassword />
        </Suspense>
    );
}