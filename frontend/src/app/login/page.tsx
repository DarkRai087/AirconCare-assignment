'use client';

     import { useForm } from 'react-hook-form';
     import { useAuth } from '../../context/AuthContext';
     import { useRouter } from 'next/navigation';

     interface LoginForm {
       email: string;
       password: string;
     }

     export default function Login() {
       const { register, handleSubmit } = useForm<LoginForm>();
       const { login, register: registerUser } = useAuth();
       const router = useRouter();

       const onSubmit = async (data: LoginForm) => {
         try {
           await login(data.email, data.password);
           router.push('/dashboard');
         } catch (error: any) {
           // If login fails, try to register and then login
           try {
             await registerUser(data.email, data.password, 'CLIENT');
             await login(data.email, data.password);
             router.push('/dashboard');
           } catch (regError) {
             console.error('Login and registration failed:', regError);
           }
         }
       };

       return (
         <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
           <div className="p-10 bg-black/80 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 flex flex-col items-center">
             <h1 className="text-4xl font-extrabold mb-8 text-center text-white tracking-tight">Login</h1>
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 w-full">
               <input
                 type="email"
                 {...register('email')}
                 placeholder="Email address or phone number"
                 autoComplete="username"
                 className="w-full p-4 bg-[#f5f6fa] text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition text-base font-medium"
               />
               <input
                 type="password"
                 {...register('password')}
                 placeholder="Password"
                 autoComplete="current-password"
                 className="w-full p-4 bg-[#f5f6fa] text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition text-base font-medium"
               />
               <button type="submit" className="w-full p-4 bg-[#1877f2] hover:bg-[#166fe0] text-white font-bold rounded-lg shadow-md transition text-lg tracking-wide">
                 Log in
               </button>
               <div className="text-center mt-2">
                 <a href="#" className="text-blue-600 hover:underline text-sm">Forgotten password?</a>
               </div>
               <div className="border-t border-gray-200 my-4"></div>
               <button type="button" onClick={() => router.push('/register')} className="w-full p-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition text-lg tracking-wide">
                 Create new account
               </button>
             </form>
           </div>
         </div>
       );
     }