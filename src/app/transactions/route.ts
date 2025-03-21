import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = `https://test-explorer.plasticherokorea.com/api`;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const page = searchParams.get('page');
    const offset = searchParams.get('offset');

    console.log('JK IN');
    try {
        const response = await axios.get(
            `${API_URL}?module=account&action=txlist&sort=desc&address=${address}&page=${page}&offset=${offset}`
        );
        
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}