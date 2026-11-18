import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the official AI Assistant for Hasanah Tech Solutions.
Your job is to help website visitors learn about Hasanah Tech Solutions, its services, team, process, and how to get in touch.

Company Information:
- Name: Hasanah Tech Solutions (operating since 2018)
- Tagline: Innovate | Empower | Transform — Bespoke Software & Digital Solutions
- Mission: Building scalable, highly secure web systems, automation tools, and premium digital products that elevate business operations worldwide.
- Team:
  * Musab bin Sharif — Founder, Next.js & Django Developer
  * Obaidullah — MERN Stack Developer (React, Node.js, Express, MongoDB)
  * Fatimah Hasan — Head of Product & UI/UX
  * Adrian Tan — Director of Intelligent Automation
- Core Services:
  1. Web Application Development (Next.js, React, Node.js, SSR/SPA, API integrations)
  2. Mobile App Development (Flutter, React Native for iOS & Android)
  3. AI & Machine Learning Solutions (Custom LLM integrations, RAG document agents, conversational CRM bots)
  4. Cloud Services & DevOps (Google Cloud, AWS, Docker/Kubernetes, CI/CD, Firebase/Cloud SQL)
  5. Premium UI/UX Product Design (Figma wireframes, design systems, conversion-focused UX)
  6. Custom ERP & Operational Systems (Multi-user roles, inventory, automated invoicing & PDF generation)
- Development Process:
  1. Discovery Workshop -> 2. Figma UI/UX Sprints -> 3. Clean Engineering -> 4. Rigorous Safety Audit (OWASP) -> 5. Deployment & Launch -> 6. Ongoing SLA Support.
- Contact Details:
  * Phone / WhatsApp: 01670555719 (+8801670555719)
  * Email: musabbinsharf321@gmail.com
  * Contact Page: /contact

Guidelines:
- Reply in the same language the visitor uses (English, Bengali, or Banglish).
- Keep responses concise, friendly, and clear (2-4 short sentences or bullet points).
- For exact project pricing or custom quotes, invite them to share their requirements on the Contact page (/contact) or message directly on WhatsApp (+8801670555719).
- Never invent fake pricing, fake clients, or unverified claims.`;

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

function getFallbackReply(message: string): string {
  const q = message.toLowerCase();

  if (q.includes('service') || q.includes('ki ki') || q.includes('kaj') || q.includes('offer')) {
    return 'Hasanah Tech Solutions provides Web Application Development (Next.js/React/Node.js), Mobile Apps (Flutter/React Native), AI & Automation Solutions, Cloud & DevOps, UI/UX Design, and Custom ERP Systems. Which service are you interested in?';
  }
  if (q.includes('price') || q.includes('cost') || q.includes('budget') || q.includes('taka') || q.includes('khoroch') || q.includes('quote')) {
    return 'Project cost depends on your features and timeline. You can share your requirements on our Contact page (/contact) or message us directly on WhatsApp (01670555719) for a free consultation and custom quote!';
  }
  if (q.includes('team') || q.includes('founder') || q.includes('about') || q.includes('somporke') || q.includes('who')) {
    return 'Hasanah Tech Solutions (founded by Musab bin Sharif) has been building custom software since 2018. Our team specializes in Next.js, Django, MERN stack, UI/UX design, and AI automation to help businesses scale cleanly.';
  }
  if (q.includes('contact') || q.includes('whatsapp') || q.includes('phone') || q.includes('email') || q.includes('call') || q.includes('jogajog')) {
    return 'You can reach us directly on WhatsApp or Phone at 01670555719, or email musabbinsharf321@gmail.com. You can also use the WhatsApp button right here!';
  }

  return 'Hello! Welcome to Hasanah Tech Solutions. We build custom web apps, mobile apps, AI solutions, and ERP systems. Ask me about our services, team, or click the WhatsApp button to talk to us directly at 01670555719.';
}

const MODEL_FALLBACKS = [
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
];

export async function POST(req: NextRequest) {
  let message = '';
  try {
    const body = await req.json();
    message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json({
        reply: getFallbackReply(message),
        source: 'fallback',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      ...history.slice(-8).map((item) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    for (const model of MODEL_FALLBACKS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.6,
            maxOutputTokens: 400,
          },
        });
        const reply = response.text?.trim();
        if (reply) {
          return NextResponse.json({ reply, source: model });
        }
      } catch (modelErr) {
        console.warn(`Model ${model} failed, trying next fallback:`, modelErr);
      }
    }

    return NextResponse.json({
      reply: getFallbackReply(message),
      source: 'quota-fallback',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      reply: getFallbackReply(message),
      source: 'error-fallback',
    });
  }
}
