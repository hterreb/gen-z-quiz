import { NextResponse } from 'next/server';

// This is a simple in-memory store. In production, use a database
let highScore = {
  score: 0,
  alias: 'Anonymous',
  time: 0
};

export async function GET() {
  return NextResponse.json(highScore);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  // Only update if it's a higher score
  if (data.score > highScore.score && data.score > 0) {
    highScore = {
      score: data.score,
      alias: data.alias || 'Anonymous',
      time: data.time
    };
    return NextResponse.json(highScore);
  }
  
  return NextResponse.json(
    { message: 'Score not high enough' },
    { status: 400 }
  );
} 