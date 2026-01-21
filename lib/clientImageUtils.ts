/**
 * Crops an image to a specified aspect ratio.
 * 
 * @param file The input image file
 * @param aspectWidth The width component of the aspect ratio (default: 2)
 * @param aspectHeight The height component of the aspect ratio (default: 3)
 * @returns A Promise that resolves to a newly created File object containing the cropped image
 */
export async function cropImage(
    file: File,
    aspectWidth: number = 2,
    aspectHeight: number = 3
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const sourceRatio = img.width / img.height;
                const targetRatio = aspectWidth / aspectHeight;

                let drawWidth = img.width;
                let drawHeight = img.height;
                let startX = 0;
                let startY = 0;

                // Calculate crop dimensions (centered crop)
                if (sourceRatio > targetRatio) {
                    // Image is wider than target: fit height, crop width
                    // We want the result height to be the full image height
                    // The result width should correspond to the target ratio

                    // Wait, 'drawWidth' and 'drawHeight' are source dimensions used for the destination canvas?
                    // No, let's actually calculate the SOURCE rectangle we want to take.

                    const cropHeight = img.height;
                    const cropWidth = cropHeight * targetRatio;

                    startX = (img.width - cropWidth) / 2;
                    startY = 0;
                    drawWidth = cropWidth;
                    drawHeight = cropHeight;
                } else {
                    // Image is taller than target: fit width, crop height
                    const cropWidth = img.width;
                    const cropHeight = cropWidth / targetRatio;

                    startX = 0;
                    startY = (img.height - cropHeight) / 2;
                    drawWidth = cropWidth;
                    drawHeight = cropHeight;
                }

                const canvas = document.createElement("canvas");
                // We can set the canvas resolution. Let's aim for at least 400x600, or keeping the source resolution if higher.
                // Actually, let's keep the source resolution of the cropped area to avoid downscaling unless necessary,
                // but resizing to the target dimension 400x600 might be what the user implied by "store only that".
                // The user said "show a gray layer on 400x600 dimention ratio and store only that in storage".
                // It implies the result SHOULD BE 400x600 or at least that ratio.
                // Let's standardise to a reasonable high res multiplier of 400x600, e.g. 800x1200 or just keep source resolution.
                // For simplicity and quality, let's keep the source resolution of the cropped area.

                canvas.width = drawWidth;
                canvas.height = drawHeight;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Draw the cropped portion
                ctx.drawImage(
                    img,
                    startX, startY, drawWidth, drawHeight, // Source rectangle
                    0, 0, drawWidth, drawHeight // Destination rectangle
                );

                canvas.toBlob((blob) => {
                    if (blob) {
                        const croppedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(croppedFile);
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                }, file.type);
            };

            img.onerror = () => reject(new Error("Failed to load image"));
            if (e.target?.result) {
                img.src = e.target.result as string;
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}
