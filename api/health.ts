
export function GET() {
  return Response.json({
    status: "healthy",
    model: "gemini-3.1-flash-lite",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
}
