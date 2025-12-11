import { GoogleGenAI, Type } from "@google/genai";
import { TimelineGroup, TimelineItem } from '../types';
import moment from 'moment';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSchedule = async (groups: TimelineGroup[], items: TimelineItem[]): Promise<string> => {
  const scheduleContext = JSON.stringify({
    doctors: groups.map(g => ({ id: g.id, name: g.title, speciality: g.category })),
    operations: items.map(i => ({
      doctor_id: i.group,
      title: i.title,
      room: i.operationRoom,
      start: moment(i.start_time).format('YYYY-MM-DD HH:mm'),
      end: moment(i.end_time).format('YYYY-MM-DD HH:mm'),
      details: i.description
    }))
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a medical scheduling assistant for a busy hospital. Analyze the following surgery schedule and provide a brief, insightful summary of the workload, potential doctor fatigue/conflicts, and utilization of operation rooms. Keep it under 150 words.
      
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
  const groupContext = JSON.stringify(groups.map(g => ({ id: g.id, name: g.title, speciality: g.category })));
  const now = moment().format('YYYY-MM-DD HH:mm');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current Time: ${now}.
      Available Doctors: ${groupContext}.
      User Request: "${prompt}"
      
      Create a JSON object for the requested operation(s). Map the operation to the most appropriate doctor based on their speciality (e.g., heart -> Cardiology).
      Calculate start_time and end_time as Unix timestamps (numbers) based on the "Current Time".
      If the duration isn't specified, assume 2 hours for standard operations.
      Assign a realistic Operation Room (OR-1 to OR-4) if not specified.
      
      Return a JSON object with this schema:
      {
        "responseMessage": "A short confirmation message for the user",
        "items": [
          {
            "title": "Operation Title",
            "group": 1, // The ID of the doctor
            "start_time": 1234567890000,
            "end_time": 1234567890000,
            "description": "Patient details or notes",
            "operationRoom": "OR-1"
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
                  operationRoom: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Assign random IDs and apply doctor's specific color
    const newItemsWithIds = (result.items || []).map((item: any) => {
      const assignedGroup = groups.find(g => g.id === item.group);
      return {
        ...item,
        id: Math.floor(Math.random() * 100000) + 1000,
        className: assignedGroup ? assignedGroup.eventClassName : 'bg-slate-500 text-white'
      };
    });

    return {
      text: result.responseMessage || "Operations scheduled.",
      newItems: newItemsWithIds
    };

  } catch (error) {
    console.error("Gemini Event Creation Error:", error);
    return { text: "Failed to process request.", newItems: [] };
  }
};