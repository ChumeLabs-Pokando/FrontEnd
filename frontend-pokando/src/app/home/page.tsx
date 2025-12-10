'use client'; // Importante: Roda no navegador

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserData {
  nome: string;
  email: string;
  foto: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Função para buscar os dados do usuário
    const fetchUser = async () => {
      try {
        // 1. Tenta recuperar o token JWT do localStorage (Login Local)
        const token = localStorage.getItem("jwt_token");

        // 2. Faz a chamada ao Backend
        const response = await fetch('http://localhost:8080/usuarios/me', {
          credentials: 'include', // Mantém o Cookie do Google (JSESSIONID)
          headers: {
            'Content-Type': 'application/json',
            // Se houver token, adiciona o cabeçalho Authorization (Login Local)
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Se der erro (ex: 401), limpa o token e manda de volta pro login
          console.error("Não autorizado");
          localStorage.removeItem("jwt_token"); // Limpa token inválido
          router.push('/');
        }
      } catch (error) {
        console.error("Erro ao buscar usuário", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Função de Logout
  const handleLogout = () => {
    // Limpa token do local e redireciona
    localStorage.removeItem("jwt_token");
    // Opcional: Chamar endpoint de logout do backend se necessário para limpar cookies
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">
          Carregando suas informações...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra Superior */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="text-2xl font-bold text-indigo-600">Pokando</div>
            
            {/* Perfil do Usuário */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nome}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              {user.foto ? (
                <Image
                  src={user.foto}
                  alt="Foto de Perfil"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-indigo-100"
                />
              ) : (
                // Placeholder caso não tenha foto (comum no login local)
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Botão de Sair */}
              <button 
                onClick={handleLogout}
                className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Olá, <strong>{user.nome.split(' ')[0]}</strong>! Você está logado no sistema.
            </p>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Seus Próximos Eventos</h3>
              <div className="mt-4 rounded-md bg-gray-50 p-4 border border-gray-200">
                <p className="text-sm text-gray-500 italic">Nenhum evento encontrado (ainda!).</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}