import { graphConfig } from "../authConfig";

/**
 * Calls Microsoft Graph API with the provided access token
 * @param {string} accessToken - The access token acquired from MSAL
 * @returns {Promise} - Promise containing the user profile information
 */
export const callMsGraph = async (accessToken) => {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);

    const options = {
        method: "GET",
        headers: headers
    };

    try {
        const response = await fetch(graphConfig.graphMeEndpoint, options);
        
        if (!response.ok) {
            throw new Error(`Graph API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error calling MS Graph:", error);
        throw error;
    }
}; 