"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const GOOGLE_LOGIN_URL = "http://localhost:8080/oauth2/authorization/google";

  // Estado para alternar entre Login e Cadastro
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "", // Usaremos email como 'login' e 'username'
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegistering) {
        // --- LÓGICA DE CADASTRO ---
        const res = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login: formData.email, // Backend espera 'login'
            email: formData.email,
            nome: formData.nome,
            senha: formData.senha, // Backend espera 'senha'
          }),
        });

        if (!res.ok) throw new Error("Erro ao criar conta.");
        
        // Se deu certo, volta para tela de login e avisa
        alert("Conta criada com sucesso! Faça login.");
        setIsRegistering(false);
      } else {
        // --- LÓGICA DE LOGIN ---
        const res = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.email, // Backend AuthenticationController espera 'username' no LoginRequest
            password: formData.senha, // Backend AuthenticationController espera 'password' no LoginRequest
          }),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("Email ou senha inválidos.");
          }
          throw new Error("Erro ao realizar login.");
        }

        const data = await res.json();
        
        // SALVAR O TOKEN
        // O backend retorna: { token: "...", type: "Bearer", expiresIn: ... }
        // Salvamos no localStorage para usar nas chamadas futuras
        localStorage.setItem("jwt_token", data.token);

        // Opcional: Salvar em cookie se o backend esperar cookie em vez de header
        document.cookie = `jwt_token=${data.token}; path=/; max-age=${data.expiresIn}`;

        // Redirecionar para Home
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bem-vindo ao Pokando
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering
              ? "Crie sua conta para começar"
              : "Faça login para gerenciar seus eventos"}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Formulário Local */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            {isRegistering && (
              <div>
                <input
                  name="nome"
                  type="text"
                  required
                  className="relative block w-full rounded-t-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Nome Completo"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>
            )}
            <div>
              <input
                name="email"
                type="email"
                required
                className={`relative block w-full border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                  isRegistering ? "" : "rounded-t-md"
                }`}
                placeholder="Endereço de Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="senha"
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
            >
              {loading ? "Processando..." : isRegistering ? "Cadastrar" : "Entrar"}
            </button>
          </div>
        </form>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Ou continue com</span>
          </div>
        </div>

        {/* Botão Google */}
        <div>
          <Link
            href={GOOGLE_LOGIN_URL}
            className="flex w-full justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-semibold leading-6">Google</span>
          </Link>
        </div>

        {/* Toggle Login/Registro */}
        <div className="text-center text-sm">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isRegistering
              ? "Já tem uma conta? Faça Login"
              : "Não tem uma conta? Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
}