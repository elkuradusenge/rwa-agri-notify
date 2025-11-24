// --- Configuration & Data ---

// 1. Rwandan Districts with Coordinates (Approximate centers)
const DISTRICTS = {
    "Kigali (Gasabo)": { lat: -1.95, lon: 30.09, region: "Central" },
    "Musanze": { lat: -1.50, lon: 29.63, region: "North" },
    "Huye": { lat: -2.60, lon: 29.74, region: "South" },
    "Rubavu": { lat: -1.67, lon: 29.26, region: "West" },
    "Kayonza": { lat: -1.95, lon: 30.51, region: "East" },
    "Nyagatare": { lat: -1.29, lon: 30.32, region: "East" },
    "Rusizi": { lat: -2.48, lon: 28.90, region: "West" },
    "Gicumbi": { lat: -1.61, lon: 30.11, region: "North" }
};

// 2. Crop Database (The "Brain")
const CROP_DATA = [
    { name: "Maize (Ibigori)", season: ["A"], regions: ["North", "East", "South", "Central", "West"], water: "High", risk: "Drought" },
    { name: "Beans (Ibishyimbo)", season: ["A", "B"], regions: ["All"], water: "Medium", risk: "Heavy Rain" },
    { name: "Irish Potatoes (Ibirayi)", season: ["A", "B"], regions: ["North", "West"], water: "Medium", risk: "Heat" },
    { name: "Sorghum (Amasaka)", season: ["B"], regions: ["East", "South", "Central"], water: "Low", risk: "None" },
    { name: "Cassava (Imyumbati)", season: ["All"], regions: ["South", "East", "West"], water: "Low", risk: "Waterlogging" },
    { name: "Vegetables (Imboga)", season: ["C"], regions: ["All"], water: "High", risk: "Drought" },
    { name: "Rice (Umuceri)", season: ["A", "B"], regions: ["East", "South"], water: "Very High", risk: "Drought" },
    { name: "Wheat (Ingano)", season: ["A", "B"], regions: ["North", "West"], water: "Medium", risk: "Heat" }
];

// --- State Management ---
let currentState = {
    location: null,
    weather: null,
    season: null,
    map: null,
    marker: null,
    geoJsonLayer: null
};

// --- Core Logic: The Agri-Decision Engine ---

/**
 * Determines the current Agricultural Season in Rwanda.
 * Season A: Sept - Jan (Planting starts Sept)
 * Season B: Feb - June (Planting starts Feb/Mar)
 * Season C: July - Aug (Dry season, marshlands)
 */
function getRwandaSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    
    if (month >= 9 || month <= 1) {
        return { 
            id: "A", 
            name: "Imuhindo (Season A)", 
            desc: "The short rainy season. Ideal for Maize and Beans." 
        };
    } else if (month >= 2 && month <= 6) {
        return { 
            id: "B", 
            name: "Urugaryi (Season B)", 
            desc: "The long rainy season. Good for Sorghum and Potatoes." 
        };
    } else {
        return { 
            id: "C", 
            name: "Impeshyi (Season C)", 
            desc: "The dry season. Focus on marshlands and irrigation." 
        };
    }
}

/**
 * Analyzes weather data to generate specific agricultural warnings.
 */
function analyzeWeather(weather) {
    const alerts = [];
    const current = weather.current;
    
    // Thresholds
    const HEAT_THRESHOLD = 28; // Celsius
    const HEAVY_RAIN_THRESHOLD = 10; // mm
    const HIGH_HUMIDITY = 80; // %

    if (current.temperature_2m > HEAT_THRESHOLD) {
        alerts.push({ type: "warning", msg: "High Heat: Risk of evaporation. Mulching recommended." });
    }
    
    if (current.rain > 0.5) {
        alerts.push({ type: "info", msg: "Raining Now: Pause spraying pesticides." });
    }

    if (current.rain > HEAVY_RAIN_THRESHOLD) {
        alerts.push({ type: "danger", msg: "Heavy Rain Alert: Risk of soil erosion. Delay planting beans." });
    }

    if (current.relative_humidity_2m > HIGH_HUMIDITY) {
        alerts.push({ type: "warning", msg: "High Humidity: Risk of fungal diseases (Blight)." });
    }

    if (alerts.length === 0) {
        alerts.push({ type: "success", msg: "Conditions are favorable for standard activities." });
    }

    return alerts;
}

/**
 * Filters crops based on Season, Region, and Weather Risks.
 */
function getRecommendations(season, region, weather) {
    const alerts = analyzeWeather(weather);
    const heavyRain = weather.current.rain > 10;
    const highHeat = weather.current.temperature_2m > 28;

    return CROP_DATA.filter(crop => {
        // 1. Season Match
        if (!crop.season.includes(season.id) && !crop.season.includes("All")) return false;
        
        // 2. Region Match
        if (!crop.regions.includes(region) && !crop.regions.includes("All")) return false;

        // 3. Weather Risk Filtering (The "Smart" part)
        if (heavyRain && crop.risk === "Heavy Rain") return false; // Don't plant beans in heavy rain
        if (highHeat && crop.risk === "Heat") return false; // Don't plant potatoes in high heat

        return true;
    });
}

// --- API Integration ---

async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain&timezone=auto`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather API Error");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// --- UI Functions ---

function init() {
    const select = document.getElementById('district-select');
    
    // Populate Dropdown
    for (const [name, data] of Object.entries(DISTRICTS)) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }

    // Event Listener
    select.addEventListener('change', handleLocationChange);

    // Initialize Map
    initMap();
}

function initMap() {
    // Center on Rwanda
    currentState.map = L.map('map').setView([-1.9403, 29.8739], 9); 

    // Use CartoDB Voyager tiles (Faster & Cleaner)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(currentState.map);

    // Fix for map rendering issues
    setTimeout(() => {
        currentState.map.invalidateSize();
    }, 100);

    // Load Rwanda Districts GeoJSON
    fetch('./data/districts.geojson')
        .then(response => response.json())
        .then(data => {
            currentState.geoJsonLayer = L.geoJSON(data, {
                style: {
                    color: '#3388ff',      // Default border color
                    weight: 1,
                    opacity: 0.5,
                    fillOpacity: 0.1
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(feature.properties.name);
                }
            }).addTo(currentState.map);
        })
        .catch(err => console.error("Error loading GeoJSON:", err));
}

async function handleLocationChange(e) {
    const districtName = e.target.value;
    const districtData = DISTRICTS[districtName];
    
    // Show Loaders
    document.getElementById('weather-display').innerHTML = '<div class="loader">Fetching live data...</div>';
    document.getElementById('season-display').innerHTML = '<div class="loader">Analyzing season...</div>';
    
    // 1. Get Season
    const season = getRwandaSeason();
    currentState.season = season;

    // 2. Get Weather
    const weather = await fetchWeather(districtData.lat, districtData.lon);
    currentState.weather = weather;
    currentState.location = districtData;

    // 3. Update UI
    updateDashboard(season, weather, districtData.region);
    
    // 4. Update Map
    updateMap(districtData);
}

function updateMap(location) {
    const { lat, lon } = location;
    const map = currentState.map;
    
    // Ensure map is correctly sized before flying
    map.invalidateSize();

    // Fly to location
    map.flyTo([lat, lon], 13, {
        animate: true,
        duration: 1.5
    });

    // Update Marker
    if (currentState.marker) {
        map.removeLayer(currentState.marker);
    }

    currentState.marker = L.circleMarker([lat, lon], {
        color: '#0d8a47',
        fillColor: '#0d8a47',
        fillOpacity: 0.8,
        radius: 12
    }).addTo(map)
        .bindPopup(`<b>${document.getElementById('district-select').value}</b><br>${location.region} Region`)
        .openPopup();

    // Highlight District Boundary
    if (currentState.geoJsonLayer) {
        currentState.geoJsonLayer.eachLayer(layer => {
            // Reset style
            currentState.geoJsonLayer.resetStyle(layer);
            
            // Check if this is the selected district
            if (layer.feature.properties.name === document.getElementById('district-select').value) {
                layer.setStyle({
                    color: '#0d8a47',       // Green Border
                    weight: 3,
                    fillColor: '#0d8a47',
                    fillOpacity: 0.3
                });
                map.fitBounds(layer.getBounds());
            }
        });
    }
}

function updateDashboard(season, weather, region) {
    // A. Update Weather Card
    const temp = weather.current.temperature_2m;
    const rain = weather.current.rain;
    const humidity = weather.current.relative_humidity_2m;
    
    document.getElementById('weather-display').innerHTML = `
        <div class="weather-main">${temp}°C</div>
        <div class="weather-details">
            <span><i class="fa-solid fa-droplet"></i> ${humidity}% Hum</span>
            <span><i class="fa-solid fa-cloud-rain"></i> ${rain} mm</span>
        </div>
    `;

    // B. Update Season Card
    document.getElementById('season-display').innerHTML = `
        <div class="season-badge">${season.name}</div>
        <p class="season-desc">${season.desc}</p>
    `;

    // C. Update Alerts
    const alerts = analyzeWeather(weather);
    const alertContainer = document.getElementById('alert-list');
    alertContainer.innerHTML = '';
    
    alerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item`;
        div.style.borderLeftColor = alert.type === 'danger' ? '#e74c3c' : (alert.type === 'warning' ? '#f1c40f' : '#2ecc71');
        div.innerHTML = `<strong>${alert.type.toUpperCase()}:</strong> ${alert.msg}`;
        alertContainer.appendChild(div);
    });

    // D. Update Recommendations
    const crops = getRecommendations(season, region, weather);
    const cropContainer = document.getElementById('crop-list');
    cropContainer.innerHTML = '';

    if (crops.length === 0) {
        cropContainer.innerHTML = '<p class="placeholder-text">No specific crops recommended for these conditions.</p>';
    } else {
        crops.forEach(crop => {
            const div = document.createElement('div');
            div.className = 'crop-item';
            div.innerHTML = `
                <span class="crop-name">${crop.name}</span>
                <span class="crop-reason">Matches Season ${season.id} & ${region}</span>
            `;
            cropContainer.appendChild(div);
        });
    }
}

// Start App
document.addEventListener('DOMContentLoaded', init);
