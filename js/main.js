$(document).ready(function () {
    $('#qr-form').on('submit', generateQRCode);
    $('#logo-upload').on('change', handleLogoUpload);
});

function generateQRCode(e) {
    e.preventDefault();

    showLoading();

    let text = $('#qr-text').val();
    let color = $('#color-picker').val();
    let size = $('#qr-size').val();
    let logoDataUrl = $('#logo-preview').attr('src');

    createQRCode(text, color, size, logoDataUrl)
        .then(displayAndDownloadQRCode)
        .catch((error) => {
            console.error(error);
            hideLoading();
            alert('An error occurred while generating the QR code. Please try again.');
        });
}

function createQRCode(text, color, size, logoDataUrl) {
    return new Promise((resolve, reject) => {
        try {
            let qrCode = new QRious({
                value: text,
                size: parseInt(size),
                level: 'H',
                background: 'transparent',
                foreground: color
            });

            let dataURL = qrCode.toDataURL();
            if (logoDataUrl) {
                addLogoToQRCode(dataURL, logoDataUrl, size)
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve(dataURL);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function addLogoToQRCode(qrDataURL, logoDataURL, size) {
    return new Promise((resolve, reject) => {
        const qrImage = new Image();
        const logoImage = new Image();
        qrImage.src = qrDataURL;
        logoImage.src = logoDataURL;

        Promise.all([
            new Promise((resolve) => qrImage.onload = resolve),
            new Promise((resolve) => logoImage.onload = resolve),
        ]).then(() => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(qrImage, 0, 0, size, size);

                const logoSize = size / 4;
                const logoPosition = (size - logoSize) / 2;
                ctx.drawImage(logoImage, logoPosition, logoPosition, logoSize, logoSize);

                resolve(canvas.toDataURL());
            } catch (error) {
                reject(error);
            }
        });
    });
}

function handleLogoUpload(e) {
    let file = e.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onloadend = function () {
        $('#logo-preview').attr('src', reader.result);
    }
    reader.readAsDataURL(file);
}

function displayAndDownloadQRCode(dataURL) {
    const qrCodePreview = document.getElementById('qrCodePreview');
    const qrCodeDownload = document.getElementById('qrCodeDownload');

    qrCodePreview.src = dataURL;
    qrCodeDownload.href = dataURL;

    hideLoading();
    showQRModal();
}

function showLoading() {
    $('#loading').removeClass('d-none');
}

function hideLoading() {
    $('#loading').addClass('d-none');
}

function showQRModal() {
    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    qrModal.show();
}
