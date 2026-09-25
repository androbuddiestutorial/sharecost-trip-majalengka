import { LoginButton } from "./login-button";

export const metadata = {
  title: "Admin Login - Sharecosttrip Majalengka",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Login Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk dengan akun Google yang terdaftar sebagai admin untuk mengelola website Sharecosttrip.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
