import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits for base64 image payload upload
  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini client with standard user agent header
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Extract endpoint for grades and absence extraction from the report card image
  app.post("/api/extract", async (req, res) => {
    try {
      const { image, mimeType } = req.body;

      if (!image || !mimeType) {
        return res.status(400).json({ error: "Fehlendes Bild oder Dateityp." });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API-Schlüssel ist auf dem Server nicht konfiguriert." });
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: image,
        },
      };

      const promptPart = {
        text: `Du bist ein präziser Extraktor für Schulzeugnisse in Deutschland.
Deine Aufgabe ist es, aus dem Bild des Zeugnisses ausschließlich Fächer mit den zugehörigen Noten sowie die Fehltage (entschuldigt und unentschuldigt) zu extrahieren.

WICHTIGE REGELN:
1. Erfinde NIEMALS einen Wert. Wenn ein Fach, eine Note oder ein Fehltag nicht zweifelsfrei lesbar oder auf dem Zeugnis nicht vorhanden ist, trage stattdessen 'unleserlich' ein.
2. Ignoriere und gib NIEMALS den Namen der Person, das Geburtsdatum, den Namen der Schule, Klassenlehrer:innen, Adressen oder sonstige identifizierende Angaben aus. Diese Daten sind streng geheim und dürfen unter keinen Umständen im Output auftauchen.
3. Extrahiere alle Fächer und die dazugehörigen Noten. Die Noten können Ziffern (z.B. 1, 2+, 3-, 12, 08) oder Worte (z.B. 'sehr gut', 'gut', 'teilgenommen') sein.
4. Extrahiere die Anzahl der Fehltage:
   - Fehltage entschuldigt (excused absent days)
   - Fehltage unentschuldigt (unexcused absent days)
   Wenn auf dem Zeugnis nur 'Fehltage insgesamt' steht, trage die gesamten Fehltage bei 'Fehltage entschuldigt' ein und '0' oder 'unleserlich' bei 'Fehltage unentschuldigt'.

Gib die Daten exakt strukturiert im geforderten JSON-Format zurück.`,
      };

      let response;
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;

      while (attempts < maxAttempts) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: [imagePart, promptPart] },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subjects: {
                    type: Type.ARRAY,
                    description: "Liste der Schulfächer und deren Noten.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        subject: {
                          type: Type.STRING,
                          description: "Der genaue Name des Schulfachs, z.B. Mathe, Deutsch, Sport, Englisch, Physik."
                        },
                        grade: {
                          type: Type.STRING,
                          description: "Die Note für dieses Fach, z.B. '1', '2+', '12', 'sehr gut', oder 'unleserlich'."
                        }
                      },
                      required: ["subject", "grade"]
                    }
                  },
                  absentDaysExcused: {
                    type: Type.STRING,
                    description: "Anzahl der entschuldigten Fehltage als Zahl (z.B. '5'), '0' falls keine vorhanden, oder 'unleserlich'."
                  },
                  absentDaysUnexcused: {
                    type: Type.STRING,
                    description: "Anzahl der unentschuldigten Fehltage als Zahl (z.B. '1'), '0' falls keine vorhanden, oder 'unleserlich'."
                  }
                },
                required: ["subjects", "absentDaysExcused", "absentDaysUnexcused"]
              }
            }
          });
          break; // Successfully got response
        } catch (err: any) {
          attempts++;
          lastError = err;
          console.warn(`Attempt ${attempts} failed:`, err.message || err);

          if (attempts >= maxAttempts) {
            break;
          }

          const errMsg = (err.message || "").toLowerCase();
          const isTransient = errMsg.includes("503") || 
                              errMsg.includes("429") || 
                              errMsg.includes("unavailable") || 
                              errMsg.includes("high demand") || 
                              errMsg.includes("rate limit") || 
                              errMsg.includes("resource exhausted") ||
                              err.status === 503 || 
                              err.status === 429;

          if (isTransient) {
            const delay = attempts * 1500;
            console.log(`Transient error detected (${err.status || "503"}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            break; // Non-transient error, fail fast
          }
        }
      }

      if (!response) {
        const errMsg = (lastError?.message || "").toLowerCase();
        if (errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand") || lastError?.status === 503) {
          return res.status(503).json({
            error: "Die Gemini-API ist momentan wegen sehr hoher Nachfrage ausgelastet. Bitte warte einen kurzen Moment und versuche es gleich noch einmal."
          });
        }
        if (errMsg.includes("429") || errMsg.includes("rate limit") || lastError?.status === 429) {
          return res.status(429).json({
            error: "Zu viele Anfragen in kurzer Zeit. Bitte warte ein paar Sekunden und versuche es noch einmal."
          });
        }
        return res.status(500).json({
          error: lastError?.message || "Fehler beim Auslesen des Zeugnisses. Bitte versuche es mit einem klareren Foto noch einmal."
        });
      }

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: "Keine Antwort von der Gemini API erhalten." });
      }

      const parsedData = JSON.parse(text.trim());
      return res.json(parsedData);
    } catch (error: any) {
      console.error("Extraction error:", error);
      return res.status(500).json({ error: error.message || "Serverfehler während der Textextraktion." });
    }
  });

  // Serve Vite or static assets depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
