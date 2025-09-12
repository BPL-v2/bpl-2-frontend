import { oauthApi } from "@client/client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getCallbackUrl } from "@utils/oauth";
import { useEffect } from "react";
import { router } from "../main";

type CallbackProps = {
  state: string;
  code: string;
  error?: string;
  error_description?: string;
  provider: "poe" | "discord" | "twitch";
};
export type OauthQueryParams = {
  state: string;
  code: string;
  error?: string;
  error_description?: string;
};

export function Callback({
  state,
  code,
  error,
  error_description,
  provider,
}: CallbackProps) {
  const qc = useQueryClient();

  useEffect(() => {
    // Development logging - only in dev mode
    if (import.meta.env.DEV) {
      console.log(`[OAuth Debug] Callback started for provider: ${provider}`);
      console.log(`[OAuth Debug] State: ${state}, Code: ${code ? 'present' : 'missing'}`);
    }
    
    if (error) {
      if (import.meta.env.DEV) {
        console.log(`[OAuth Debug] Error detected: ${error}`);
      }
      return;
    }
    if (!state || !code || !provider) {
      if (import.meta.env.DEV) {
        console.log('[OAuth Debug] Missing required parameters, redirecting to home');
      }
      router.navigate({
        to: "/",
      });
      return;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[OAuth Debug] Making API call for ${provider} OAuth callback`);
    }
    
    oauthApi
      .oauthCallback(provider, {
        redirect_url: getCallbackUrl(provider),
        state: state,
        code: code,
      })
      .then((resp) => {
        if (import.meta.env.DEV) {
          console.log(`[OAuth Debug] ${provider} OAuth successful`);
          console.log(`[OAuth Debug] Discord connected: ${!!resp.user.discord_id}`);
        }
        
        localStorage.setItem("auth", resp.auth_token);
        qc.invalidateQueries({
          queryKey: ["user"],
        });
        
        // If we just completed POE OAuth and Discord is not connected, redirect to Discord OAuth
        if (provider === "poe" && !resp.user.discord_id) {
          if (import.meta.env.DEV) {
            console.log('[OAuth Debug] POE OAuth complete, but Discord not connected. Redirecting to Discord OAuth...');
          }
          // Create a new OAuth redirect to Discord, preserving the original destination
          oauthApi
            .oauthRedirect("discord", getCallbackUrl("discord"), resp.last_path)
            .then((urlString) => {
              if (import.meta.env.DEV) {
                console.log(`[OAuth Debug] Discord OAuth URL generated`);
              }
              window.open(urlString, "_self");
            });
          return;
        }
        
        if (import.meta.env.DEV) {
          console.log(`[OAuth Debug] Authentication complete. Redirecting to destination.`);
        }
        
        router.navigate({
          to: resp.last_path,
        });
      })
      .catch((err) => {
        // Keep error logging in production for debugging purposes
        console.error(`[OAuth] ${provider} authentication failed:`, err);
      });
  }, [state, code, provider, error, qc]);
  if (error) {
    return (
      <>
        <h1 className="text-3xl font-bold text-center text-error">
          Error: {error} - {error_description}
        </h1>
        <Link to="/" className="btn btn-primary mt-4">
          Return to home page
        </Link>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="loading loading-spinner loading-lg"></div>
      <h1 className="text-2xl font-semibold">
        {provider === "poe" ? "Authenticating with Path of Exile..." : 
         provider === "discord" ? "Authenticating with Discord..." :
         "Handling Authentication..."}
      </h1>
      {provider === "poe" && (
        <p className="text-center text-base-content/70">
          After connecting your Path of Exile account, you'll be prompted to connect Discord.
        </p>
      )}
    </div>
  );
}
