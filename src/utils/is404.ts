import * as http from 'http';
import * as https from 'https';

export function is404(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            resolve(response.statusCode === 404);
        }).on('error', (error) => {
            console.error('Error fetching URL:', error);
            resolve(false); // Assuming any error means the URL is not returning a 404
        });
    });
}