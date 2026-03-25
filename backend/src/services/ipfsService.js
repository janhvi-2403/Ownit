const crypto = require('crypto');

/**
 * Mocking IPFS upload because direct IPFS pinata keys are not provided.
 * This simulates uploading a buffer to IPFS and returning a hash.
 */
const uploadToIPFS = async (fileBuffer, fileName) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert actual file buffer into a highly scalable Base64 Data URI!
    // This allows the browser to natively open the exact file they uploaded without needing to host an IPFS node or local pathing
    const base64 = fileBuffer.toString('base64');
    let mimeType = 'application/pdf';
    if (fileName) {
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.png')) mimeType = 'image/png';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
        if (lower.endsWith('.gif')) mimeType = 'image/gif';
    }
    return `data:${mimeType};base64,${base64}`;
};

/**
 * Generate a complete tamper-proof verification hash for a document.
 */
const generateVerificationHash = (documentBuffer, metadata) => {
    const hash = crypto.createHash('sha256');
    hash.update(documentBuffer);
    hash.update(JSON.stringify(metadata));
    return hash.digest('hex');
};

module.exports = {
    uploadToIPFS,
    generateVerificationHash
};
