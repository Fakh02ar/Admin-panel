export async function GET() {
  return Response.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString()
  })
}