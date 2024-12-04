import { NextResponse } from 'next/server';
import { isAddress } from 'viem';

export async function GET(request: Request) {
  try {
    // Get the identifier from URL parameters
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return new Response(JSON.stringify({ 
        error: 'Identifier is required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // If it's already an Ethereum address
    if (isAddress(identifier)) {
      return new Response(JSON.stringify({
        address: identifier,
        preferredName: identifier,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // TODO: Add ENS resolution logic here
    // For now, return basic info
    return new Response(JSON.stringify({
      address: null,
      preferredName: identifier,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in resolve API:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to resolve identifier'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 