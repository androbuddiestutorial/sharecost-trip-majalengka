"use client";

import { useEffect } from "react";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  async function registerServiceWorkerAndSubscribe() {
    try {
      // 1. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // 2. Request Notification Permission
      const permission = await window.Notification.requestPermission();
      if (permission !== 'granted') {
        console.log("Notification permission denied");
        return;
      }

      // 3. Get existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      // 4. If no subscription, create one
      if (!subscription) {
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
          console.error("VAPID public key not found");
          return;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }

      // 5. Send subscription to our server to save it
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      console.log("Push notification subscription successful");

    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  }

  useEffect(() => {
    // Check if the browser supports service workers and push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorkerAndSubscribe();
    }
  }, []);

  return null; // This component doesn't render anything visible
}

