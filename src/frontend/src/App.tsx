import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import type React from "react";
import { useEffect } from "react";
import Layout from "./components/Layout";
import { PaperProvider } from "./context/PaperContext";
import { SyllabusProvider } from "./context/SyllabusContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AddQuestionPage from "./pages/AddQuestionPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PDFPreviewPage from "./pages/PDFPreviewPage";
import PaperGeneratorPage from "./pages/PaperGeneratorPage";
import QuestionBankPage from "./pages/QuestionBankPage";
import SettingsPage from "./pages/SettingsPage";

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Authenticated layout wrapper
function AuthLayout({
  children,
  title,
}: { children: React.ReactNode; title: string }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[oklch(0.17_0.04_255)] border-t-transparent" />
      </div>
    );
  }

  if (!identity) {
    window.location.href = "/login";
    return null;
  }

  return <Layout title={title}>{children}</Layout>;
}

// Protected page routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AuthLayout title="Dashboard">
      <DashboardPage />
    </AuthLayout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthLayout title="Dashboard">
      <DashboardPage />
    </AuthLayout>
  ),
});

const addQuestionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-question",
  component: () => (
    <AuthLayout title="Add Question">
      <AddQuestionPage />
    </AuthLayout>
  ),
});

const questionBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/question-bank",
  component: () => (
    <AuthLayout title="Question Bank">
      <QuestionBankPage />
    </AuthLayout>
  ),
});

const generatePaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/generate-paper",
  component: () => (
    <AuthLayout title="Generate Paper">
      <PaperGeneratorPage />
    </AuthLayout>
  ),
});

const pdfPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-preview",
  component: () => (
    <AuthLayout title="PDF Preview">
      <PDFPreviewPage />
    </AuthLayout>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <AuthLayout title="Settings">
      <SettingsPage />
    </AuthLayout>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  dashboardRoute,
  addQuestionRoute,
  questionBankRoute,
  generatePaperRoute,
  pdfPreviewRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <SyllabusProvider>
      <PaperProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </PaperProvider>
    </SyllabusProvider>
  );
}
