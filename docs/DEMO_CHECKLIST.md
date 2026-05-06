# GardenOps AI Demo Checklist

Use this checklist before recording or showing the MVP.

## Before Demo

- Restart Expo after installing native modules: `npm.cmd run start`.
- Use `Start fresh demo` in Settings if you want to return to onboarding.
- Use the onboarding demo garden shortcut or enter a real-looking location, size, sunlight, and goal.
- Toggle Premium Demo in Settings when showing Profit Mode or unlimited AI plans.

## Demo Flow

1. Onboarding: create a balcony, backyard, or allotment garden.
2. Dashboard: show plan summary, next tasks, monthly crop value, and premium badges.
3. Planner: generate one AI plan on Free, then show the premium limit or toggle Premium Demo.
4. Tasks: generate Smart Tasks after Premium Demo is enabled.
5. Profit: show crop cost, yield, resale value, and profit rows.
6. Scanner: choose a plant image, then analyze it with the mock scanner or configured endpoint.
7. Settings: show account mode, optional Firebase demo sync, export JSON data, and premium toggle.

## Backend Readiness

- `EXPO_PUBLIC_AI_PLANNER_ENDPOINT` calls an OpenAI-backed garden planner.
- `EXPO_PUBLIC_WEATHER_TASKS_ENDPOINT` calls a weather-backed task generator.
- `EXPO_PUBLIC_PLANT_ID_ENDPOINT` calls a backend Plant ID proxy.
- Firebase keys enable anonymous Auth and Firestore sync.

Keep all API secrets on the backend. Do not place OpenAI, weather, Plant ID, or Apple IAP secrets in Expo public env vars.
