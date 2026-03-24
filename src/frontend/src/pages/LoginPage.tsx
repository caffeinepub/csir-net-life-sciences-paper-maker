import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import React, { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) navigate({ to: "/dashboard" });
  }, [identity, navigate]);

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.005_255)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border border-border w-full max-w-md p-10"
        data-ocid="login.modal"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[oklch(0.17_0.04_255)] flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            CSIR NET Life Sciences
          </h1>
          <p className="text-muted-foreground mt-1">
            Paper Maker — Admin Portal
          </p>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100 mb-6">
          <ShieldCheck
            size={18}
            className="text-blue-600 flex-shrink-0 mt-0.5"
          />
          <p className="text-sm text-blue-700">
            Secure access via Internet Identity. Only authorized admins can
            manage the question bank.
          </p>
        </div>

        <Button
          onClick={() => login()}
          disabled={isLoggingIn || isInitializing}
          className="w-full h-11 bg-[oklch(0.17_0.04_255)] hover:bg-[oklch(0.24_0.06_255)] text-white text-sm font-medium"
          data-ocid="login.submit_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Connecting...
            </>
          ) : (
            "Login with Internet Identity"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Powered by the Internet Computer Protocol
        </p>
      </motion.div>
    </div>
  );
}
