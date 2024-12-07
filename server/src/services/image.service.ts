import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

export class ImageService {
    // Load environment variables for Pollinations and ImgBB
    private pollinationsUrl: string = process.env.POLLINATIONS_URL || '';
    private imgbbApiKey: string = process.env.IMGBB_API_KEY || '';
    private imgbbUploadUrl: string = process.env.IMGBB_UPLOAD_URL || '';
    private localStoragePath: string = path.resolve('images');

    constructor() {
        if (!this.imgbbApiKey && !this.pollinationsUrl) {
            throw new Error('IMGBB_API_KEY or POLLINATIONS_URL is required in environment variables');
        }
    }

    /**
     * Generates an image URL from Pollinations AI using a given text prompt.
     * @param prompt - The text prompt for generating the image.
     * @param width - The desired width of the image.
     * @param height - The desired height of the image.
     * @returns The generated image URL.
     */
    async generateImage(prompt: string, width: number, height: number): Promise<string> {
        try {
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `${this.pollinationsUrl}${encodedPrompt}?width=${width}&height=${height}`;
            return imageUrl; // Return Pollinations-generated image URL
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error generating image:', errorMessage);
            throw new Error('Failed to generate image.');
        }
    }

    /**
     * Uploads an image to ImgBB and returns the image URL.
     * @param imageBuffer - The image buffer to upload.
     * @returns The URL of the uploaded image.
     */
    async uploadToImgBB(imageBuffer: Buffer): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', imageBuffer.toString('base64'));

            const response = await axios.post(this.imgbbUploadUrl, formData, {
                params: { key: this.imgbbApiKey },
                headers: formData.getHeaders(),
            });

            if (response.data && response.data.data && response.data.data.url) {
                return response.data.data.url; // Return ImgBB image URL
            } else {
                throw new Error('Invalid ImgBB response');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error uploading to ImgBB:', errorMessage);
            throw new Error('Failed to upload image.');
        }
    }

    /**
     * Stores an image locally and returns the local path.
     * @param imageBuffer - The image buffer to store.
     * @param courseId - The course ID for folder structuring.
     * @param imageName - The name of the image file.
     * @returns The local file path of the stored image.
     */
    async storeImageLocally(imageBuffer: Buffer, courseId: number, imageName: string): Promise<string> {
        try {
            // Base storage path for local files
            const coursePath = path.resolve('images', `${courseId}`);

            // Ensure directories exist
            fs.mkdirSync(coursePath, { recursive: true });

            // Define the full file path
            const filePath = path.join(coursePath, imageName);

            // Write the image buffer to a file
            fs.writeFileSync(filePath, imageBuffer);

            // Construct a public URL using the base URL
            const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000/images';
            const accessibleUrl = `${baseUrl}/${courseId}/${imageName}`;

            return accessibleUrl; // Return the accessible URL
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error storing image locally:', errorMessage);
            throw new Error('Failed to store image locally.');
        }
    }

    /**
     * Generates and uploads/stores an image, returning the URL or local path.
     * @param prompt - The text prompt for generating the image.
     * @param size - The size type of the image ('thumbnail', 'banner', etc.).
     * @param local - Flag to store the image locally.
     * @param courseId - The course ID for organizing local storage.
     * @returns The URL or local path of the generated image.
     */
    async generateAndUploadImage(
        prompt: string,
        size: 'thumbnail' | 'banner',
        local: boolean,
        courseId: number
    ): Promise<string> {
        try {
            // Define dimensions based on size type
            const dimensions = {
                thumbnail: { width: 300, height: 200 },
                banner: { width: 1200, height: 600 },
            };

            const { width, height } = dimensions[size] || dimensions['thumbnail'];

            // Generate image from Pollinations
            const imageUrl = await this.generateImage(prompt, width, height);

            // Fetch the image data
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            if (local) {
                // Store image locally
                const imageName = `${size}-${Date.now()}.jpg`;
                return await this.storeImageLocally(imageBuffer, courseId, imageName);
            } else {
                // Upload to ImgBB
                return await this.uploadToImgBB(imageBuffer);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error in generateAndUploadImage:', errorMessage);
            throw new Error('Failed to generate and upload/store image.');
        }
    }
}

export default new ImageService();