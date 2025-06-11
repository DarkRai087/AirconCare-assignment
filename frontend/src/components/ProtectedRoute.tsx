import { ReactNode } from 'react';
     import { useAuth } from '../context/AuthContext';
     import { useRouter } from 'next/navigation';
     import { useEffect } from 'react';

     export function ProtectedRoute({ children }: { children: ReactNode }) {
       const { user } = useAuth();
       const router = useRouter();

       useEffect(() => {
         if (!user) {
           router.push('/login');
         }
       }, [user, router]);

       if (!user) return null;
       return children;
     }