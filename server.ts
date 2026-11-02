import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google Gen AI helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Sleep helper for backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Robust Gemini call with retries and fallback models
async function generateGeminiContentWithFallback(contents: string, config: any) {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // Model list to try in order of preference
  const modelsToTry = ['gemini-3.7-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isTransient =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('high demand') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED');

        console.warn(`[AI Engine] Attempt ${attempt} on model ${model} failed (${isTransient ? 'transient' : 'fatal'}): ${errMessage}`);

        if (isTransient && attempt < 2) {
          await sleep(600 * attempt);
        } else {
          // Break to next model in fallback list
          break;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini model calls failed');
}

// Intelligent Persian heuristic fallback generator
function generateHeuristicCover(topic: string, niche: string) {
  const cleanTopic = (topic || 'راهنمای جامع وردپرس').trim();
  const words = cleanTopic.split(/\s+/).filter(Boolean);

  // Pick highlight word
  const longWords = words.filter((w) => w.length >= 4 && !['برای', 'درباره', 'روش‌های', 'راهنمای', 'چگونه'].includes(w));
  const highlightWord = longWords[0] || words[1] || words[0] || 'وردپرس';

  // Determine theme
  let recommendedTheme = 'editorial';
  const lower = cleanTopic.toLowerCase();
  if (lower.includes('سئو') || lower.includes('برنامه') || lower.includes('کد') || lower.includes('هوش مصنوعی') || lower.includes('تکنولوژی') || lower.includes('ai')) {
    recommendedTheme = 'tech';
  } else if (lower.includes('پزشکی') || lower.includes('سلامت') || lower.includes('طبیعت') || lower.includes('گیاه')) {
    recommendedTheme = 'nature';
  } else if (lower.includes('کسب') || lower.includes('مارکتینگ') || lower.includes('فروش') || lower.includes('درآمد')) {
    recommendedTheme = 'vibrant';
  } else if (lower.includes('روان') || lower.includes('لایف') || lower.includes('زندگی') || lower.includes('کتاب')) {
    recommendedTheme = 'warm';
  }

  // Determine image keywords
  let imageKeywords = 'education study';
  if (recommendedTheme === 'tech') imageKeywords = 'technology code';
  else if (recommendedTheme === 'nature') imageKeywords = 'nature health';
  else if (recommendedTheme === 'vibrant') imageKeywords = 'business growth';
  else if (recommendedTheme === 'warm') imageKeywords = 'lifestyle books';

  return {
    title: cleanTopic,
    highlightWord,
    category: niche || 'آموزش و یادگیری',
    siteTagline: 'مرجع مقالات و آموزش‌های تخصصی',
    recommendedTheme,
    imageKeywords,
    altText: `کاور و تصویر شاخص مقاله ${cleanTopic} با پسوند بهینه وب پی`,
  };
}

function generateHeuristicHeadlines(content: string) {
  const clean = (content || 'آموزش وردپرس').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const coreSubject = words.slice(0, 4).join(' ') || 'موضوع مقاله';
  const keyword = words.find((w) => w.length >= 4 && !['برای', 'درباره', 'چگونه'].includes(w)) || 'آموزش';

  return [
    {
      title: `${coreSubject}: راهنمای گام‌به‌گام و جامع`,
      highlightWord: 'راهنمای جامع',
      category: 'آموزش تخصصی',
      styleReason: 'فرمت تحریریه استاندارد با نرخ کلیک بالا',
    },
    {
      title: `۱۰ نکته حیاتی درباره ${coreSubject} که باید بدانید`,
      highlightWord: '۱۰ نکته حیاتی',
      category: 'راهنمای کاربردی',
      styleReason: 'استفاده از قدرت عدد و فوریت',
    },
    {
      title: `صفر تا صد ${coreSubject} در سال ۲۰۲۶`,
      highlightWord: 'صفر تا صد',
      category: 'به‌روزرسانی',
      styleReason: 'ایجاد حس تسلط و جامع بودن',
    },
    {
      title: `چگونه با ${coreSubject} بازدهی خود را ۳ برابر کنیم؟`,
      highlightWord: '۳ برابر',
      category: 'رشد و توسعه',
      styleReason: 'پرسشی و انگیزشی با محرک قوی',
    },
  ];
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// AI endpoint: Generate cover suggestions from a topic or draft article
app.post('/api/ai/suggest-cover', async (req, res) => {
  const { topic, niche } = req.body;

  try {
    const ai = getGenAI();

    if (!ai) {
      const fallbackData = generateHeuristicCover(topic, niche);
      return res.json({
        success: true,
        data: fallbackData,
        isFallback: true,
        notice: 'داده‌ها با الگوریتم هوشمند داخلی تولید شدند (کلید API تعریف نشده است).',
      });
    }

    const prompt = `شما یک طراح گرافیک و متخصص سئوی محتوای وردپرس فارسی هستید.
بر اساس موضوع یا عنوان داده شده زیر:
موضوع/عنوان: "${topic || 'راهنمای جامع'}"
حوزه کاری: "${niche || 'عمومی'}"

لطفاً اطلاعات زیر را برای یک کاور حرفه‌ای و جذاب مقاله وردپرس (با استاندارد CTR بالا) به صورت JSON خروجی دهید:
1. title: عنوان اصلی جذاب و کوتاه (حداکثر ۶ الی ۹ کلمه)
2. highlightWord: دقیقاً یک یا دو کلمه کلیدی اصلی از داخل عنوان که باید هایلایت شود
3. category: نام دسته بندی جذاب (مثلا برنامه‌نویسی، آموزش کنکور، تکنولوژی، سئو و...)
4. siteTagline: یک شعار کوتاه یا نام وبسایت پیشنهادی فارسی
5. recommendedTheme: یکی از تم‌های رنگی: "editorial" (کلاسیک تحریریه), "tech" (تکنولوژی تیره و نئون), "minimal" (مینیمال ملایم), "vibrant" (شاد و جذاب), "nature" (طبیعت و سلامت), "warm" (گرم و پاستلی)
6. imageKeywords: دو کلمه انگلیسی برای جستجوی تصویر پس‌زمینه مرتبط در Unsplash
7. altText: متن جایگزین بهینه سئو برای تگ Alt وردپرس`;

    const result = await generateGeminiContentWithFallback(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          highlightWord: { type: Type.STRING },
          category: { type: Type.STRING },
          siteTagline: { type: Type.STRING },
          recommendedTheme: { type: Type.STRING },
          imageKeywords: { type: Type.STRING },
          altText: { type: Type.STRING },
        },
        required: ['title', 'highlightWord', 'category', 'siteTagline', 'recommendedTheme', 'imageKeywords', 'altText'],
      },
    });

    const parsed = JSON.parse(result.text || '{}');
    return res.json({ success: true, data: parsed, modelUsed: result.modelUsed });
  } catch (error: any) {
    console.error('[AI Suggestion] Gemini service unavailable or error occurred, using smart heuristic fallback:', error?.message || error);
    // Smooth, graceful fallback: never return 500 error to client
    const fallbackData = generateHeuristicCover(topic, niche);
    return res.json({
      success: true,
      data: fallbackData,
      isFallback: true,
      notice: 'سرور جمنای موقتاً با ترافیک بالا مواجه شد؛ پیشنهاد بهینه با دستیار هوشمند محلی آماده شد.',
    });
  }
});

// AI endpoint: Generate 4 catchy headline variations from raw text or draft
app.post('/api/ai/generate-headlines', async (req, res) => {
  const { content } = req.body;

  try {
    const ai = getGenAI();

    if (!ai) {
      const fallbackHeadlines = generateHeuristicHeadlines(content);
      return res.json({
        success: true,
        data: fallbackHeadlines,
        isFallback: true,
      });
    }

    const prompt = `متن یا خلاصه پست وردپرس زیر را تحلیل کن و ۴ عنوان به شدت جذاب و کلیک‌خور (Click-worthy) برای کاور وبلاگ همراه با کلمه هایلایت و دسته بندی تولید کن:
متن:
"${content}"`;

    const result = await generateGeminiContentWithFallback(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            highlightWord: { type: Type.STRING },
            category: { type: Type.STRING },
            styleReason: { type: Type.STRING },
          },
          required: ['title', 'highlightWord', 'category'],
        },
      },
    });

    const parsed = JSON.parse(result.text || '[]');
    return res.json({ success: true, data: parsed, modelUsed: result.modelUsed });
  } catch (error: any) {
    console.error('[AI Headlines] Gemini service unavailable or error, using heuristic headline generator:', error?.message || error);
    const fallbackHeadlines = generateHeuristicHeadlines(content);
    return res.json({
      success: true,
      data: fallbackHeadlines,
      isFallback: true,
      notice: 'پیشنهادات با الگوریتم سئو محلی آماده شدند.',
    });
  }
});

// Endpoint to download the entire project source code as a ZIP file
app.get('/api/download-project', (req, res) => {
  try {
    const pythonScript = `import zipfile, os
zip_path = 'public/project-source.zip'
exclude_dirs = {'node_modules', '.git', '.aistudio', '__pycache__'}
exclude_files = {'project-source.zip', '.DS_Store'}

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        for file in files:
            if file in exclude_files or file.endswith('.zip') or (file.startswith('.') and file not in {'.gitignore', '.env.example'}):
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, '.')
            zipf.write(full_path, arcname)
`;
    execSync(`python3 -c "${pythonScript}"`);
    const zipFilePath = path.join(process.cwd(), 'public', 'project-source.zip');
    if (fs.existsSync(zipFilePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="wordpress-cover-generator.zip"');
      return res.sendFile(zipFilePath);
    } else {
      return res.status(404).send('فایل فشرده پروژه یافت نشد.');
    }
  } catch (err: any) {
    console.error('Error generating project zip:', err);
    const zipFilePath = path.join(process.cwd(), 'public', 'project-source.zip');
    if (fs.existsSync(zipFilePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="wordpress-cover-generator.zip"');
      return res.sendFile(zipFilePath);
    }
    return res.status(500).json({ error: 'خطا در ایجاد فایل زیپ پروژه' });
  }
});

// Start Server with Vite or static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WordPress Cover WebP Generator running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
