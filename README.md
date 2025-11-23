# RwaAgriNotify v2.0 🇷🇼🌾

A smart agricultural decision-support system for Rwandan farmers. This application goes beyond simple weather forecasting by interpreting real-time data to provide actionable farming advice based on Rwanda's specific agricultural seasons (Imuhindo, Urugaryi, Impeshyi).

## Features
- **Localized Weather:** Real-time data for specific Rwandan districts (Musanze, Huye, Kayonza, etc.).
- **Smart Season Logic:** Automatically detects the current agricultural season (Season A, B, or C).
- **Agri-Decision Engine:** Analyzes weather risks (Heat, Heavy Rain, Humidity) and filters crop recommendations accordingly.
- **Premium UI:** Glassmorphism design with responsive layout.

## Part 1: Local Implementation

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge).
- An internet connection (to fetch API data).

### How to Run
1. Clone this repository.
2. Navigate to the project folder: `rwa-agri-notify-v2`.
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
   sudo git clone <YOUR_REPO_URL> .
   ```
5. Ensure Nginx is running: `sudo systemctl restart nginx`

### Step 2: Configure Load Balancer (Lb01)
1. SSH into the Load Balancer.
2. Install HAProxy: `sudo apt install haproxy -y`
3. Edit configuration: `sudo nano /etc/haproxy/haproxy.cfg`
4. Add the backend configuration:
   ```haproxy
   frontend http_front
      bind *:80
      default_backend web_servers

   backend web_servers
      balance roundrobin
      server web01 <WEB01_IP>:80 check
      server web02 <WEB02_IP>:80 check
   ```
5. Restart HAProxy: `sudo systemctl restart haproxy`

## APIs Used
- **Open-Meteo API:** Used for fetching real-time weather and forecasts. No API key required.
  - Docs: [https://open-meteo.com/](https://open-meteo.com/)

## Credits
- Developed by [Your Name]
- Weather Data by Open-Meteo
- Icons by FontAwesome
- Fonts by Google Fonts (Outfit)
