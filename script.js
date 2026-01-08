document.addEventListener('DOMContentLoaded', () => {
    const readerElement = "reader";
    const resultCard = document.getElementById('result-card');
    const scannerContainer = document.getElementById('scanner-container');
    const resetBtn = document.getElementById('reset-btn');

    // UI Elements
    const productImg = document.getElementById('product-image');
    const productName = document.getElementById('product-name');
    const productBrand = document.getElementById('product-brand');
    const productIngredients = document.getElementById('product-ingredients');
    const productUsage = document.getElementById('product-usage');
    const nutriscoreBadge = document.getElementById('nutriscore-badge');

    let html5QrcodeScanner = null;

    function onScanSuccess(decodedText, decodedResult) {
        // Stop scanning after success
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                scannerContainer.classList.add('hidden');
                fetchProductData(decodedText);
            }).catch(error => {
                console.error("Failed to clear scanner", error);
            });
        }
    }

    function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    }

    async function fetchProductData(barcode) {
        // Show loading state implicitly by showing the card with placeholders or a spinner if preferred
        // For now, we will populate the card then show it.
        
        const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 1) {
                const product = data.product;
                displayProduct(product);
            } else {
                alert("Prodotto non trovato!");
                resetScanner();
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Errore nel recupero dei dati del prodotto.");
            resetScanner();
        }
    }

    function displayProduct(product) {
        resultCard.classList.remove('hidden');

        // Populate Data
        productName.textContent = product.product_name || "Nome sconosciuto";
        productBrand.textContent = product.brands || "Marca sconosciuta";
        productImg.src = product.image_front_url || 'https://via.placeholder.com/150?text=No+Image';
        
        // Ingredients
        productIngredients.textContent = product.ingredients_text_it || product.ingredients_text || "Ingredienti non disponibili.";

        // Usage / Storage (Looking for various fields as 'usage' is not standard everywhere)
        // Some products have 'stores' or 'preparation' fields.
        let usageInfo = [];
        if (product.preservation_categories) usageInfo.push(product.preservation_categories);
        if (product.serving_quantity) usageInfo.push(`Porzione: ${product.serving_quantity}`);
        if (product.preparation_state) usageInfo.push(`Stato: ${product.preparation_state}`);
        
        productUsage.textContent = usageInfo.length > 0 ? usageInfo.join('. ') : "Nessuna istruzione specifica trovata.";

        // Nutriscore
        if (product.nutriscore_grade) {
            nutriscoreBadge.textContent = `Nutriscore: ${product.nutriscore_grade.toUpperCase()}`;
            // Color code
            const scoreColorMap = {
                'a': '#1e7e48', // Green
                'b': '#85bb2f',
                'c': '#fecb02',
                'd': '#ee8100',
                'e': '#e63e11'  // Red
            };
            nutriscoreBadge.style.color = scoreColorMap[product.nutriscore_grade] || '#fff';
        } else {
            nutriscoreBadge.textContent = "";
        }
    }

    function startScanner() {
        resultCard.classList.add('hidden');
        scannerContainer.classList.remove('hidden');

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }

    function resetScanner() {
        resultCard.classList.add('hidden');
        scannerContainer.classList.remove('hidden');
        startScanner();
    }

    resetBtn.addEventListener('click', resetScanner);

    // Initial Start
    startScanner();
});
