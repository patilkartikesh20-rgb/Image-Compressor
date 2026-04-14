const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const qualityRange = document.getElementById('qualityRange');
const qualityLabel = document.getElementById('quality-label');
const compressBtn = document.getElementById('compressBtn');

let selectedFile = null;

// 1. Update quality label when sliding
qualityRange.oninput = (e) => {
    qualityLabel.innerText = `${e.target.value}%`;
};

// 2. Make the box clickable
dropZone.onclick = () => fileInput.click();

// 3. Handle file selection via Click
fileInput.onchange = (e) => {
    handleFile(e.target.files[0]);
};

// 4. Handle Drag & Drop
dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#8b5cf6"; // Glow purple on hover
};

dropZone.ondragleave = () => {
    dropZone.style.borderColor = "rgba(255, 255, 255, 0.2)";
};

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "rgba(255, 255, 255, 0.2)";
    const file = e.dataTransfer.files[0];
    handleFile(file);
};

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        // Update UI to show file is selected
        dropZone.querySelector('p').innerHTML = `Selected: <strong>${file.name}</strong>`;
        console.log("File loaded:", file.name);
    } else {
        alert("Please drop a valid image file (JPG/PNG).");
    }
}

// 5. The Upload/Compress Logic
compressBtn.onclick = async () => {
    if (!selectedFile) {
        alert("Please select an image first!");
        return;
    }

    compressBtn.innerText = "Processing...";
    compressBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('quality', qualityRange.value);

    try {
        const response = await fetch('/compress', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('result-area').classList.remove('hidden');
            document.getElementById('original-size').innerText = data.originalSize;
            document.getElementById('new-size').innerText = data.compressedSize;
            document.getElementById('savings-val').innerText = `Saved ${data.savings}`;
            
            const dl = document.getElementById('downloadLink');
            dl.href = data.imageData;
            dl.download = `nowhere_${selectedFile.name}`;
        } else {
            alert("Server error during compression.");
        }
    } catch (err) {
        console.error(err);
        alert("Could not connect to the server. Is it running?");
    } finally {
        compressBtn.innerText = "Optimize Now";
        compressBtn.disabled = false;
    }
};