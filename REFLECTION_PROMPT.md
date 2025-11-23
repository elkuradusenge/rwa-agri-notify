# AI Reflection Prompt

**Role:** Senior Agrotech Solutions Architect.

**Context:** We are building "RwaAgriNotify", a web application for Rwandan farmers. The goal is to move beyond a simple weather dashboard and create a decision-support system.

**Current State:** The application fetches weather data and displays it. It has a basic list of crops.

**Reflection Task:**
Please review the current codebase and logic. Reflect on the following critical points:
1.  **Value Proposition:** Does the app currently just *show* weather, or does it *interpret* it? (e.g., Instead of "25°C", does it say "Optimal temperature for Maize germination"?).
2.  **Localization:** Is the "Season" logic hardcoded to Rwandan agricultural calendars (Season A/B/C) or generic?
3.  **Algorithmic Depth:** How can we improve the recommendation algorithm? Currently, it might just list crops. Can we add a "Suitability Score" based on the live weather forecast (e.g., "High Risk" vs "Ideal Conditions")?

**Output:**
Provide a critique of the current logic and suggest 3 specific code refactors to make the application smarter and more valuable to a farmer in a rural Rwandan district.
