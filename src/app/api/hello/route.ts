import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Hello World endpoint
 *     description: Returns a welcome message
 *     tags:
 *       - Hello
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello from VynTech Solutions API!
 */
export async function GET() {
  return NextResponse.json({ message: "Hello from VynTech Solutions API!" });
}

/**
 * @swagger
 * /api/hello:
 *   post:
 *     summary: Create a greeting
 *     description: Creates a personalized greeting message
 *     tags:
 *       - Hello
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello, John!
 */
export async function POST(request: Request) {
  const body = await request.json();
  const name = body.name || "Guest";
  return NextResponse.json({ message: `Hello, ${name}!` });
}
