# RwaAgriNotify v2.0 🇷🇼🌾

A smart agricultural decision-support system for Rwandan farmers. This application goes beyond simple weather forecasting by interpreting real-time data to provide actionable farming advice based on Rwanda's specific agricultural seasons (Imuhindo, Urugaryi, Impeshyi).

## Features
- **Localized Weather:** Real-time data for specific Rwandan districts (Musanze, Huye, Kayonza, etc.).
- **Smart Season Logic:** Automatically detects the current agricultural season (Season A, B, or C).
- **Agri-Decision Engine:** Analyzes weather risks (Heat, Heavy Rain, Humidity) and filters crop recommendations accordingly.
- **Premium UI:** Glassmorphism design with responsive layout.
- **Server configs:** Load balance handles request made on www.kuradusenge.tech forwards them btn web-01 and web-02

## Quick links 
 - [DEMO: Agricultural Insights: Cultivating the Right Crops depending on season the Season - Vimeo](https://www.loom.com/share/63a1c5003b5d4535ae7236b094a05beb)
 - [Kuradusenge.tech]
## Part 1: Local Implementation

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge).
- An internet connection (to fetch API data).

### How to Run
1. Clone this repository.
2. Navigate to the project folder: `rwa-agri-notify`.
3. Open `index.html` in your browser.
   - Or use a local server like Live Server for VS Code.

## Part 2: Deployment Instructions

### Architecture
- **Web Servers:** Web01, Web02 (Nginx/Apache)
- **Load Balancer:** Lb01 (HAProxy)

### Step 1: Deploy to Web Servers (Web01 & Web02)
1. SSH into your server: `ssh ubuntu@<IP_ADDRESS>`
2. Update packages: `sudo apt update`
3. Install Nginx: `sudo apt install nginx -y`
4. Clone the repository to `/var/www/html/`:
   ```bash
   cd /var/www/html/
   sudo git clone https://github.com/elkuradusenge/rwa-agri-notify.git .
   ```
5. Ensure Nginx is running: `sudo service nginx restart`


## APIs & Data Sources Used
- **Open-Meteo API:** Used for fetching real-time weather and forecasts.
  - Docs: [https://open-meteo.com/](https://open-meteo.com/)
- **OpenStreetMap:** Map tiles provided by OpenStreetMap contributors.
  - Website: [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
- **Leaflet.js:** Open-source JavaScript library for mobile-friendly interactive maps.
  - Docs: [https://leafletjs.com/](https://leafletjs.com/)
- **CartoDB:** High-performance map tiles.
  - Website: [https://carto.com/](https://carto.com/)
- **Rwanda GeoJSON:** Country boundary data.
  - Source: [https://github.com/johan/world.geo.json](https://github.com/johan/world.geo.json)

## Credits
- Developed by Elie Kuradusenge
- Weather Data by Open-Meteo
- Map Data by OpenStreetMap
- Icons by FontAwesome
- Fonts by Google Fonts (Outfit)
