const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const qualityRange = document.getElementById('qualityRange');
const qualityLabel = document.getElementById('quality-label');
const compressBtn = document.getElementById('compressBtn');

let selectedFile = null;

qualityRange.oninput = (e) => qualityLabel.innerText = `${e.target.value}%`;

dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => handleFile(e.target.files[0]);

function handleFile(file) {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
        selectedFile = file;
        const icon = file.type === 'application/pdf' ? '📄' : '🖼️';
        dropZone.querySelector('p').innerHTML = `${icon} Selected: <strong>${file.name}</strong>`;
    } else {
        alert("Please upload an Image or a PDF file.");
    }
}

compressBtn.onclick = async () => {
    if (!selectedFile) return alert("Select a file first!");

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
            
            const prefix = selectedFile.type === 'application/pdf' ? 'doc_' : 'img_';
            dl.download = `${prefix}${selectedFile.name}`;
        }
    } catch (err) {
        alert("Error connecting to server.");
    } finally {
        compressBtn.innerText = "Optimize File";
        compressBtn.disabled = false;
    }
};