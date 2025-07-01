import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

/**
 * Sign in button component that provides options for sign-in using popup or redirect
 */
export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = (loginType) => {
        if (loginType === "popup") {
            instance.loginPopup(loginRequest)
                .catch(error => console.error("Popup login error:", error));
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest)
                .catch(error => console.error("Redirect login error:", error));
        }
    };

    return (
        <div className="sign-in-buttons">
            <button 
                className="btn btn-primary" 
                onClick={() => handleLogin("popup")}
            >
                Sign In
            </button>
        </div>
    );
};

export default SignInButton; 