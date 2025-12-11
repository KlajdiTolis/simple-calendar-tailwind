import { GoogleGenAI, Type } from "@google/genai";
import { TimelineGroup, TimelineItem } from '../types';
import moment from 'moment';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSchedule = async (groups: TimelineGroup[], items: TimelineItem[]): Promise<string> => {
  const scheduleContext = JSON.stringify({
    groups: groups.map(g => ({ id: g.id, name: g.title, category: g.category })),
    items: items.map(i => ({
      group_id: i.group,
      title: i.title,
      start: moment(i.start_time).format('YYYY-MM-DD HH:mm'),
      end: moment(i.end_time).format('YYYY-MM-DD HH:mm'),
      description: i.description
    }))
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful project manager assistant. Analyze the following schedule data and provide a brief, insightful summary of the workload, potential conflicts, and suggestions for optimization. Keep it under 150 words.
      
      Schedule Data:
      ${scheduleContext}`,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "An error occurred while analyzing the schedule.";
  }
};

export const createEventFromNaturalLanguage = async (
  prompt: string,
  groups: TimelineGroup[]
): Promise<{ text: string; newItems: TimelineItem[] }> => {
  const groupContext = JSON.stringify(groups.map(g => ({ id: g.id, name: g.title })));
  const now = moment().format('YYYY-MM-DD HH:mm');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current Time: ${now}.
      Available Groups: ${groupContext}.
      User Request: "${prompt}"
      
      Create a JSON object for the requested event(s). Map the event to the most appropriate group ID based on the name.
      Calculate start_time and end_time as Unix timestamps (numbers) based on the "Current Time".
      If the duration isn't specified, assume 1 hour.
      If the group isn't clear, pick the most relevant one or default to the first one.
      
      Return a JSON object with this schema:
      {
        "responseMessage": "A short confirmation message for the user",
        "items": [
          {
            "title": "Event Title",
            "group": 1, // The ID of the group
            "start_time": 1234567890000,
            "end_time": 1234567890000,
            "description": "Optional description",
            "className": "bg-purple-500 text-white border-purple-600" // Suggest a tailwind class color based on context (e.g. red for urgent, blue for dev)
          }
        ]
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseMessage: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  group: { type: Type.NUMBER },
                  start_time: { type: Type.NUMBER },
                  end_time: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  className: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Assign random IDs since the AI can't know the next ID
    const newItemsWithIds = (result.items || []).map((item: any) => ({
      ...item,
      id: Math.floor(Math.random() * 100000) + 1000, // Simple random ID
    }));

    return {
      text: result.responseMessage || "Events created.",
      newItems: newItemsWithIds
    };

  } catch (error) {
    console.error("Gemini Event Creation Error:", error);
    return { text: "Failed to process request.", newItems: [] };
  }
};