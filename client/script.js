$(document).ready(function () {
    let currentSlide = 0;
    const slides = $(".carousel-slide");
    const dots = $(".dot");

    // Function to show a specific slide
    function showSlide(index) {
        slides.removeClass("active").eq(index).addClass("active");
        dots.removeClass("active").eq(index).addClass("active");
        currentSlide = index;
    }

    // Auto-rotate the slides every 5 seconds
    setInterval(function () {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);

    // Event listeners for previous and next buttons
    $(".prev").click(function () {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    });

    $(".next").click(function () {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    });

    // Event listeners for indicator dots
    dots.click(function () {
        const index = $(this).data("slide");
        showSlide(index);
    });
});

// Initialize Select2 for searchable location dropdown
$(document).ready(function() {
    $('#uiLocations').select2({
        placeholder: "Search for a location...",
        allowClear: true
    });
});

function onPageLoad() {
    $.get("http://127.0.0.1:5000/get_location_names", function(data, status) {
        console.log("got response for get_location_names request");
        if(data && data.locations) {
            const uiLocations = document.getElementById("uiLocations");
            // Clear existing options except the placeholder
            uiLocations.innerHTML = '<option value="" disabled selected>Choose a Location</option>';
            data.locations.forEach(location => {
                const opt = new Option(location, location);
                uiLocations.appendChild(opt);
            });
            // Trigger Select2 to update after adding options
            $('#uiLocations').trigger('change');
        }
    });
}

function validateForm() {
    const sqft = parseFloat(document.getElementById("uiSqft").value);
    const beds = parseInt(document.getElementById("uiBeds").value);
    const bath = parseInt(document.getElementById("uiBathrooms").value);
    const location = document.getElementById("uiLocations").value;
    const warningMessage = document.getElementById("warningMessage");

    if (!location) {
        warningMessage.innerHTML = "Please select a location";
        warningMessage.style.display = "block";
        return false;
    }

    if (isNaN(sqft) || sqft < 300 || sqft > 8200) {
        warningMessage.innerHTML = "Total Area (SQFT) should be between 300 and 8200";
        warningMessage.style.display = "block";
        return false;
    }

    if (isNaN(bath) || bath < 1 || bath > 8 || isNaN(beds) || beds < 1 || beds > 8) {
        warningMessage.innerHTML = "Baths and Beds should be between 1 and 8";
        warningMessage.style.display = "block";
        return false;
    }

    // Fixed validation - bathrooms should not be more than bedrooms
    if (bath > beds) {
        warningMessage.innerHTML = "Number of bathrooms cannot be more than number of bedrooms";
        warningMessage.style.display = "block";
        return false;
    }

    warningMessage.style.display = "none";
    return true;
}

function onClickedEstimatedPrice(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    console.log("Estimate price button clicked");
    
    const sqft = document.getElementById("uiSqft").value;
    const beds = document.getElementById("uiBeds").value;
    const bath = document.getElementById("uiBathrooms").value;
    const location = document.getElementById("uiLocations").value;
    const estPriceDiv = document.getElementById("uiEstimatedPrice");

    // Log values for debugging
    console.log("Form Values:", {
        Sqft: parseFloat(sqft),
        Beds: parseInt(beds),
        Bath: parseInt(bath),
        Place: location
    });

    // Show loading state
    estPriceDiv.innerHTML = "<h2>Calculating...</h2>";

    $.ajax({
        url: "http://127.0.0.1:5000/predict_price",
        type: "POST",
        data: {
            Sqft: parseFloat(sqft),
            Beds: parseInt(beds),
            Bath: parseInt(bath),
            Place: location
        },
        success: function(data) {
            console.log("Received estimation:", data);
            if (data && data.estimated_price) {
                const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                }).format(data.estimated_price);
                estPriceDiv.innerHTML = `<h2>Estimated Price: ${formattedPrice}</h2>`;
            } else {
                estPriceDiv.innerHTML = "<h2>Error: Unable to calculate price</h2>";
            }
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            estPriceDiv.innerHTML = "<h2>Error: Unable to calculate price</h2>";
        }
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    onPageLoad();
    
    // Add submit event listener to the form
    const form = document.getElementById('estimateForm');
    if (form) {
        form.addEventListener('submit', onClickedEstimatedPrice);
    }
});

function updateEstimatedPrice(price) {
    const resultContent = document.querySelector('.result-content');
    resultContent.innerHTML = `<p>₹ ${price}</p>`;
    resultContent.classList.remove('show');
    // Trigger reflow
    void resultContent.offsetWidth;
    resultContent.classList.add('show');
}