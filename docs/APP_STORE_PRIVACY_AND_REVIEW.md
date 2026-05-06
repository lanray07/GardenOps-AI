# GardenOps AI Privacy And Review Answers

Use this alongside `docs/APP_STORE_METADATA.md`.

## URLs

**Marketing URL**

```text
https://id-preview-212422ef--4ebd6c62-2395-4fa2-9509-15dfd6f36821.lovable.app/
```

**Support URL**

```text
https://id-preview-212422ef--4ebd6c62-2395-4fa2-9509-15dfd6f36821.lovable.app/support
```

**Privacy Policy URL**

```text
https://id-preview-212422ef--4ebd6c62-2395-4fa2-9509-15dfd6f36821.lovable.app/privacy
```

## App Privacy

Answer these based on the MVP as currently structured.

**Does this app collect data?**

Use **Yes** if you ship Firebase sync, Plant Scanner uploads, AI planner endpoints, weather endpoints, or support email handling.

Likely data types for the current production-ready structure:

- **User Content**
  - Photos or Videos: only if Plant Scanner uploads selected plant photos to a backend.
  - Other User Content: garden profile, garden tasks, generated plans, preferred crops.
- **Identifiers**
  - User ID: if Firebase Auth/Firestore sync is enabled.
- **Contact Info**
  - Email Address: only if email sign-in or support contact collection is enabled.
- **Purchases**
  - Purchase History: once Apple In-App Purchases are connected.

Do **not** declare:

- Location: unless you collect GPS coordinates. A typed city/location string can be described as garden profile content.
- Usage Data: unless you add analytics.
- Diagnostics: unless you add crash reporting.
- Tracking: unless you add third-party tracking across apps/websites.

## App Review Information

Uncheck **Sign-in required** for the MVP.

**Review Notes**

```text
No sign-in is required to review the app. Use the "Use demo garden" button during onboarding to populate sample data. The app includes local demo mode. Firebase sync, AI planner, weather tasks, and plant ID integrations are structured as backend-ready placeholders and fall back to mock data when endpoints are not configured.
```

If Firebase is configured before review, add:

```text
Optional Firebase demo sync is available in Settings by tapping "Continue with Firebase demo sync". The reviewer can also use the app without signing in.
```

## Export Compliance

The MVP uses standard HTTPS networking. If App Store Connect asks about encryption, answer according to the production build and Apple guidance. Most apps using standard HTTPS can usually use the standard exemption path, but confirm in App Store Connect before submission.

## Screenshots

Draft screenshots are generated in:

```text
app-store/screenshots
```

Files:

```text
01-dashboard.png
02-planner.png
03-tasks.png
04-profit.png
05-scanner-settings.png
```

These are 1242 x 2688 PNG files, suitable for the iPhone screenshot upload slot shown in App Store Connect.
