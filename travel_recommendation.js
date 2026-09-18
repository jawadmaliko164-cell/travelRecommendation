const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const recommendations = document.getElementById("recommendations");
const resultMessage = document.getElementById("resultMessage");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

let travelData = null;

// Task 6: Fetch travel data from the JSON file.
async function loadTravelData() {
    try {
        const response = await fetch("travel_recommendation_api.json");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        travelData = await response.json();
        console.log("Travel recommendation data:", travelData);
    } catch (error) {
        console.error("Could not load travel data:", error);
        resultMessage.textContent = "Could not load recommendation data. Please run this project with Live Server.";
    }
}

// Normalize words so beach/beaches, temple/temples, and different letter cases work.
function normalizeKeyword(value) {
    const keyword = value.trim().toLowerCase();
    if (keyword === "beaches") return "beach";
    if (keyword === "temples") return "temple";
    if (keyword === "countries") return "country";
    return keyword;
}

function flattenData() {
    if (!travelData) return [];

    const results = [];

    (travelData.beaches || []).forEach(item => {
        results.push({ ...item, category: "beach" });
    });

    (travelData.temples || []).forEach(item => {
        results.push({ ...item, category: "temple" });
    });

    (travelData.countries || []).forEach(country => {
        (country.cities || []).forEach(city => {
            results.push({
                name: `${city.name}, ${country.name}`,
                description: city.description,
                imageUrl: city.imageUrl,
                category: "country",
                country: country.name
            });
        });
    });

    return results;
}

// Task 7 & 8: Search only after the Search button is clicked.
function searchRecommendations() {
    const keyword = normalizeKeyword(searchInput.value);

    if (!keyword) {
        resultMessage.textContent = "Please enter beach, temple, or country.";
        recommendations.innerHTML = "";
        return;
    }

    const allPlaces = flattenData();
    let matches = [];

    if (keyword === "beach" || keyword === "temple") {
        matches = allPlaces.filter(place => place.category === keyword);
    } else if (keyword === "country") {
        matches = allPlaces.filter(place => place.category === "country");
    } else {
        // Also allow a specific country/place name from the supplied JSON.
        matches = allPlaces.filter(place =>
            place.name.toLowerCase().includes(keyword) ||
            place.description.toLowerCase().includes(keyword)
        );
    }

    displayRecommendations(matches, keyword);
}

function displayRecommendations(matches, keyword) {
    recommendations.innerHTML = "";

    if (matches.length === 0) {
        resultMessage.textContent = `No recommendations found for "${keyword}". Try beach, beaches, temple, temples, country, or countries.`;
        return;
    }

    const shown = matches.slice(0, Math.max(2, matches.length));
    resultMessage.textContent = `Showing ${shown.length} recommendation(s) for "${keyword}".`;

    shown.forEach(place => {
        const card = document.createElement("article");
        card.className = "recommendation-card";

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = place.name;
        image.loading = "lazy";

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h3");
        title.textContent = place.name;

        const description = document.createElement("p");
        description.textContent = place.description;

        body.appendChild(title);
        body.appendChild(description);
        card.appendChild(image);
        card.appendChild(body);
        recommendations.appendChild(card);
    });

    document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

// Task 9: Clear button.
function clearResults() {
    searchInput.value = "";
    recommendations.innerHTML = "";
    resultMessage.innerHTML = 'Search for <strong>beach</strong>, <strong>temple</strong>, or <strong>country</strong> to see recommendations.';
}

// Enter key is a convenience feature; results still require the search action.
searchBtn.addEventListener("click", searchRecommendations);
clearBtn.addEventListener("click", clearResults);
searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") searchRecommendations();
});

// Contact form demo submission.
contactForm.addEventListener("submit", event => {
    event.preventDefault();
    formMessage.textContent = "Thank you! Your message has been received.";
    contactForm.reset();
});

loadTravelData();
