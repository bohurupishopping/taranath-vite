import axios from 'axios';

const prodBaseUrl = import.meta.env.VITE_PROD_BASE_URL || '/api'; // Default to /api if not set
const API_BASE_URL = `${prodBaseUrl}/google`;

interface ReadingResults {
    name: string;
    dateOfBirth: string;
    rashi: string;
    summary: string;
    sections: { title: string; content: string }[];
}

interface ApiResponse {
    text: string;
    model: string;
}

interface GeminiRequest {
    prompt: string;
    modelId?: string;
    stream?: boolean;
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    base64Image?: string;
    mimeType?: string;
    promptType?: 'chat' | 'fullReading' | 'verification' | 'custom';
    promptData?: Record<string, string>;
}

export const getPalmReading = async (formData: FormData): Promise<string> => {
    try {
        const fullName = formData.get('fullName') as string;
        const birthYear = formData.get('birthYear') as string;
        const rashi = formData.get('rashi') as string;
        const language = formData.get('language') as string || 'english';
        const palmImage = formData.get('palmImage') as File;

        // Convert FormData to JSON
        const jsonData: GeminiRequest = {
            prompt: '', // Initial prompt, will be replaced
            promptType: 'fullReading',
            promptData: {
                name: fullName,
                birthDetails: birthYear ? `, born in ${birthYear}` : '',
                rashi: rashi ? `, Rashi: ${rashi}` : '',
                language: language,
            },
            base64Image: await convertImageToBase64(palmImage),
            mimeType: palmImage?.type || 'image/jpeg',
        };

        const response = await axios.post<ApiResponse>(API_BASE_URL, jsonData, {
            headers: {
                'Content-Type': 'application/json', // Send as JSON
                'x-api-key': 'as1ro2k', // Replace with your actual API key
            },
        });

        // Return the raw text response
        return response.data.text;
    } catch (error: any) {
        console.error('Error fetching palm reading:', error);
        throw error;
    }
};

// Helper function to convert image to base64
const convertImageToBase64 = (image: File | null): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        if (!image) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the Data URL prefix
            const base64Content = base64String.replace(/^data:image\/\w+;base64,/, '');
            resolve(base64Content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(image);
    });
}; 