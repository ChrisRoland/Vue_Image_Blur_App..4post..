self.onmessage = function(e) {
    const imageData = e.data;
    const blurredData = applyBoxBlur(imageData);
    self.postMessage(blurredData);
};

function applyBoxBlur(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);

    const outputData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width * 4 + x * 4;
            const redSum = [0, 0, 0];
            const pixelCount = 9;

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const neighborY = y + dy;
                    const neighborX = x + dx;

                    if (neighborY >= 0 && neighborY < height && neighborX >= 0 && neighborX < width) {
                        const neighborIndex = neighborY * width * 4 + neighborX * 4;
                        redSum[0] += data[neighborIndex];
                        redSum[1] += data[neighborIndex + 1];
                        redSum[2] += data[neighborIndex + 2];
                    }
                }
            }

            const outputIndex = y * width * 4 + x * 4;
            outputData[outputIndex] = redSum[0] / pixelCount;
            outputData[outputIndex + 1] = redSum[1] / pixelCount;
            outputData[outputIndex + 2] = redSum[2] / pixelCount;
            outputData[outputIndex + 3] = data[pixelIndex + 3]; // Alpha channel
        }
    }

    return {
        width: width,
        height: height,
        data: outputData
    };    
}
