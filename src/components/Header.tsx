"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Camera, User, Settings, LogOut, Images, ExternalLink, PlayCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mentra Photo Album
            </h1>
          </Link>

          {user ? (
            <>
              {/* ナビゲーション */}
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard"
                  className={`text-sm transition-colors ${
                    pathname === '/dashboard' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link 
                  href="/albums"
                  className={`text-sm transition-colors ${
                    pathname === '/albums' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  アルバム一覧
                </Link>
              </nav>
            </>
          ) : null}

          {user ? (
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 z-[60] bg-white text-gray-900 rounded-md border shadow-md overflow-hidden"
                >
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-gray-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="bg-gray-100 h-px mx-1 my-1" />
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 text-left"
                    onClick={() => {
                      setOpen(false);
                      router.push("/albums");
                    }}
                  >
                    <Images className="h-4 w-4" />
                    <span>アルバム一覧</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 text-left"
                    onClick={() => {
                      setOpen(false);
                      router.push("/account");
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span>アカウント設定</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 text-left"
                    onClick={() => {
                      setOpen(false);
                      router.push("/demo");
                    }}
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>デモ</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 text-left"
                    onClick={() => {
                      setOpen(false);
                      window.open("https://cone-coding-04761505.figma.site/", "_blank");
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>デザインガイド（Figma）</span>
                  </button>
                  <div className="bg-gray-100 h-px mx-1 my-1" />
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 text-red-600"
                    onClick={() => {
                      setOpen(false);
                      onLogout?.();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" className="rounded-xl border-2 border-gray-300 hover:border-gray-400">
              <User className="mr-2 h-4 w-4" />
              ログイン
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}