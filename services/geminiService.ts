import { GoogleGenAI, Type } from "@google/genai";
import { TimelineGroup, TimelineItem } from '../types';
import moment from 'moment';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSchedule = async (groups: TimelineGroup[], items: TimelineItem[]): Promise<string> => {
  // Construct context that includes the nested mini-events (operations)
  const scheduleContext = JSON.stringify({
    doctors: groups.map(g => ({ id: g.id, name: g.title, speciality: g.category })),
    scheduleBlocks: items.map(i => ({
      doctor_id: i.group,
      block_title: i.title,
      start: moment(i.start_time).format('YYYY-MM-DD HH:mm'),
      end: moment(i.end_time).format('YYYY-MM-DD HH:mm'),
      operations: i.miniEvents?.map(m => ({
          operation: m.title,
          patient: m.patientName,
          time: m.time,
          room: m.operationRoom,
          notes: m.description
      })) || []
    }))
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a medical scheduling assistant for a busy hospital. Analyze the following surgery schedule blocks and the operations inside them. Provide a brief, insightful summary of the workload, potential doctor fatigue, and utilization of operation rooms. Keep it under 150 words.
      
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
      
      Create a "Main Event Block" (a container) for the requested operation(s) and assign it to the most appropriate doctor based on speciality.
      Place the specific operation details as a "miniEvent" inside this block.
      The block duration should strictly cover the operation (default 4 hours for the block if not specified).
      Assign a realistic Operation Room (OR-1 to OR-4) to the mini-event.
      
      Return a JSON object with this schema:
      {
        "responseMessage": "Short confirmation message",
        "items": [
          {
            "title": "Block Title (e.g. 'Surgery Block')",
            "group": 1, 
            "start_time": 1234567890000,
            "end_time": 1234567890000,
            "description": "Block notes",
            "isMainEvent": true,
            "maxMiniEvents": 5,
            "miniEvents": [
               {
                 "title": "Operation Name",
                 "patientName": "Patient Name (infer or use placeholder)",
                 "time": "HH:mm",
                 "operationRoom": "OR-1",
                 "description": "Details"
               }
            ]
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
                  isMainEvent: { type: Type.BOOLEAN },
                  maxMiniEvents: { type: Type.NUMBER },
                  miniEvents: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT,
                       properties: {
                          title: { type: Type.STRING },
                          patientName: { type: Type.STRING },
                          time: { type: Type.STRING },
                          operationRoom: { type: Type.STRING },
                          description: { type: Type.STRING },
                       }
                    }
                  }
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
      
      // Process miniEvents to add IDs
      const processedMiniEvents = (item.miniEvents || []).map((m: any) => ({
          ...m,
          id: Math.random().toString(36).substr(2, 9)
      }));

      return {
        ...item,
        id: Math.floor(Math.random() * 100000) + 1000,
        className: assignedGroup ? assignedGroup.eventClassName : 'bg-slate-500 text-white',
        isMainEvent: true, // Force main event
        miniEvents: processedMiniEvents
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