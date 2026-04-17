const fs = require('fs');

async function testApi() {
    const fileContent = 'test file content';

    const formData = new FormData();
    formData.append('imageType', 'face_front');
    formData.append('file', new Blob([fileContent], { type: 'image/jpeg' }), 'test.jpg');

    try {
        const response = await fetch('http://localhost:3000/api/identity-images', {
            method: 'POST',
            body: formData,
        });

        console.log('Status:', response.status);
        const json = await response.text();
        console.log('Response:', json);
    } catch (err) {
        console.log('Fetch error:', err.message);
    }
}

testApi();
