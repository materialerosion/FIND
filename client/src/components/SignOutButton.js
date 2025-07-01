import React from "react";
import { useMsal } from "@azure/msal-react";

/**
 * Sign out button component
 */
export const SignOutButton = () => {
    const { instance, accounts } = useMsal();

    const handleLogout = (logoutType) => {
        if (logoutType === "popup") {
            instance.logoutPopup({
                postLogoutRedirectUri: window.location.origin,
                mainWindowRedirectUri: window.location.origin
            }).catch(error => console.error("Popup logout error:", error));
        } else if (logoutType === "redirect") {
            instance.logoutRedirect({
                postLogoutRedirectUri: window.location.origin,
            }).catch(error => console.error("Redirect logout error:", error));
        }
    };

    return (
        <div className="sign-out-buttons">
            <span className="user-name">
                {accounts[0]?.name}
            </span>
            <button 
                className="btn btn-secondary" 
                onClick={() => handleLogout("popup")}
            >
                Sign Out
            </button>
        </div>
    );
};

export default SignOutButton; 