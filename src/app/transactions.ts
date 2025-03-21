import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = `https://test-explorer.plasticherokorea.com/api`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    console.log('JK IN');
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { address, page, offset } = req.query;

    try {
        const response = await axios.get(
            `${API_URL}?module=account&action=txlist&sort=desc&address=${address}&page=${page}&offset=${offset}`
        );
        
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
} 