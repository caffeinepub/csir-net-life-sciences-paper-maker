import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  Eye,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navItems = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-question", label: "Add Question", icon: PlusCircle },
  { to: "/question-bank", label: "Question Bank", icon: BookOpen },
  { to: "/generate-paper", label: "Generate Paper", icon: FileText },
  { to: "/pdf-preview", label: "PDF Preview", icon: Eye },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({
  children,
  title,
}: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[oklch(0.97_0.005_255)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-20 lg:hidden w-full h-full cursor-default"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--sidebar-bg)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.48_0.18_255)] flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">
              CSIR NET
            </div>
            <div className="text-[oklch(0.55_0.04_255)] text-xs">
              Life Sciences Paper Maker
            </div>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-[oklch(0.55_0.04_255)] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              location.pathname === to ||
              (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`sidebar-nav-link ${isActive ? "active" : ""}`}
                data-ocid={`nav.${label.toLowerCase().replace(/ /g, "_")}.link`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div
          className="px-3 py-4 border-t"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div
            className="px-4 py-2 text-xs"
            style={{ color: "var(--sidebar-muted)" }}
          >
            {identity?.getPrincipal().toString().slice(0, 12)}...
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-nav-link w-full"
            data-ocid="nav.logout.button"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-border shadow-sm flex-shrink-0">
          <button
            type="button"
            className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden lg:flex gap-2 text-muted-foreground"
              data-ocid="header.logout.button"
            >
              <LogOut size={14} />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-3 text-center text-xs text-muted-foreground border-t bg-white flex-shrink-0">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
