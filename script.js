const html5QrCode = new Html5Qrcode("reader");
const resultCard = document.getElementById('result');
const readerContainer = document.getElementById('reader-container');
const resetBtn = document.getElementById('reset-btn');

// Elements to populate
const prodImg = document.getElementById('product-image');
const prodName = document.getElementById('product-name');
const prodBrand = document.getElementById('product-brand');
const prodIngredients = document.getElementById('product-ingredients');
const prodUsage = document.getElementById('product-usage');

const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning
    html5QrCode.stop().then(() => {
        readerContainer.classList.add('hidden');
        fetchProductData(decodedText);
    }).catch(err => {
        console.error("Failed to stop scanning", err);
    });
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
}

async function fetchProductData(barcode) {
    try {
        // Show loading state or similar if needed
        console.log(`Fetching data for ${barcode}...`);
        
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();

        if (data.status === 1) {
            displayProduct(data.product);
        } else {
            alert("Prodotto non trovato!");
            resetScanner();
        }
    } catch (error) {
        console.error("Error fetching product data:", error);
        alert("Errore nel recupero dei dati.");
        resetScanner();
    }
}

function displayProduct(product) {
    resultCard.classList.remove('hidden');

    // Populate data
    prodName.textContent = product.product_name || "Nome sconosciuto";
    prodBrand.textContent = product.brands || "Marca sconosciuta";
    prodImg.src = product.image_front_url || 'https://via.placeholder.com/150?text=No+Image';
    
    // Ingredients
    if (product.ingredients_text_it) {
        prodIngredients.textContent = product.ingredients_text_it;
    } else if (product.ingredients_text) {
        prodIngredients.textContent = product.ingredients_text;
    } else {
        prodIngredients.textContent = "Ingredienti non disponibili.";
    }

    // Usage / Prep
    // Note: OpenFoodFacts 'usage' or 'preparation' fields are often empty or vary. 
    // We try to check a few common fields or generic info.
    // 'serving_quantity' or 'packaging' might be proxies for usage context, but real "instructions" are rare in structured format.
    // We will check for generic text or display a default message if empty.
    
    // In many cases, usage instruction isn't a standard field. We'll try to join some info if available.
    // Sometimes simple "quantity" is all we have.
    const usageInfo = [];
    if (product.quantity) usageInfo.push(`Quantità: ${product.quantity}`);
    if (product.preparation) usageInfo.push(`Preparazione: ${product.preparation}`);
    
    if (usageInfo.length > 0) {
        prodUsage.textContent = usageInfo.join('. ');
    } else {
        prodUsage.textContent = "Nessuna istruzione specifica trovata. Consultare la confezione.";
    }
}

function resetScanner() {
    resultCard.classList.add('hidden');
    readerContainer.classList.remove('hidden');
    startScanner();
}

function startScanner() {
    html5QrCode.start(
        { facingMode: "environment" }, 
        qrConfig,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error("Error starting scanner", err);
        readerContainer.innerHTML = `<p style="color:white; text-align:center; padding:20px;">Impossibile accedere alla fotocamera. Assicurati di aver dato i permessi.</p>`;
    });
}

// Initialize
resetBtn.addEventListener('click', resetScanner);
startScanner();
