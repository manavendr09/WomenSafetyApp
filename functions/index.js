"use strict";

// Choose one import style - ESM imports
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin";
import { info, error as _error } from "firebase-functions/logger";
import fetch from "node-fetch";
// Import cors as ESM
import cors from "cors";
const corsMiddleware = cors({ origin: true });

// Initialize Firebase Admin
initializeApp();

export const sendEmergencySms = onRequest((request, response) => {
  // Apply CORS middleware
  return corsMiddleware(request, response, async () => {
    // Log incoming request
    info("SMS request received", { 
      structuredData: true,
      method: request.method,
      path: request.path
    });
    
    // Check method
    if (request.method !== "POST") {
      return response.status(405).send({ error: "Method Not Allowed" });
    }

    const { message, numbers } = request.body;
    
    // Validate request
    if (!message || !numbers) {
      return response.status(400).send({ error: "Missing required parameters" });
    }

    try {
      // Call the SMS service
      const smsResponse = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          Authorization: "hpj0nYFTkbQP7Hax2zcJ3NsV0KtCXeyMW1S6IDrL5q4ZoGigRmTZmIEvGq0ltf3Q20xCacSVuPpn8UWM",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "v3",
          sender_id: "FSTSMS",
          message,
          language: "english",
          flash: 0,
          numbers,
        }),
      });

      const result = await smsResponse.json();
      
      // Log success
      info("SMS sent successfully", {
        structuredData: true,
        result
      });
      
      return response.status(200).send(result);
    } catch (error) {
      // Log error
      _error("Error sending SMS", {
        structuredData: true,
        error: error.toString()
      });
      
      return response.status(500).send({ 
        error: "Failed to send SMS",
        message: error.message
      });
    }
  });
});