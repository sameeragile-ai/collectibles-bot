import { useDroplineStore } from '../../store/useDroplineStore';
import { parseUserMessage, ParsedIntent } from './localParser';
import { runTaskSimulation } from '../simulator/engine';
import { BotTask } from '../../types';

export async function handleUserMessage(userText: string) {
  const store = useDroplineStore.getState();
  const convId = store.activeConversationId;
  if (!convId) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Add user message
  const userMsgId = 'msg-' + Date.now();
  store.addMessage(convId, {
    id: userMsgId,
    role: 'user',
    text: userText,
    timestamp: timeStr,
  });

  // 2. Add assistant placeholder message
  const assistantMsgId = 'msg-' + (Date.now() + 1);
  store.addMessage(convId, {
    id: assistantMsgId,
    role: 'assistant',
    text: '',
    timestamp: timeStr,
    isStreaming: true,
  });

  // Gather current context
  const context = {
    drops: store.drops,
    stores: store.stores,
    profiles: store.profiles,
    tasks: store.tasks,
  };

  let parsed: ParsedIntent;

  // Try calling server Gemini route
  try {
    const res = await fetch('/api/gemini/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        context: {
          activeTasks: store.tasks.map((t) => ({
            id: t.id,
            product: t.productName,
            status: t.status,
          })),
          stores: store.stores.map((s) => s.name),
          profiles: store.profiles.map((p) => p.name),
        },
      }),
    });

    const resJson = await res.json();
    if (resJson && !resJson.fallback && resJson.data) {
      const gData = resJson.data;
      parsed = mapGeminiDataToIntent(gData, userText, context);
    } else {
      parsed = parseUserMessage(userText, context);
    }
  } catch {
    // Local fallback
    parsed = parseUserMessage(userText, context);
  }

  // Execute immediate side-effects for task management if parsed
  if (parsed.intent === 'manage_tasks' && parsed.params) {
    const { action, target } = parsed.params;
    if (target === 'all') {
      if (action === 'resume') store.resumeAllTasks();
      else store.stopAllTasks();
    } else {
      if (action === 'resume') store.resumeTask(target);
      else if (action === 'delete') store.deleteTask(target);
      else store.pauseTask(target);
    }
  }

  // Stream text word-by-word
  const fullText = parsed.assistantText;
  const words = fullText.split(' ');
  let currentAccumulated = '';

  for (let i = 0; i < words.length; i++) {
    currentAccumulated += (i === 0 ? '' : ' ') + words[i];
    store.updateMessage(convId, assistantMsgId, {
      text: currentAccumulated,
    });
    // Natural delay between words
    await new Promise((r) => setTimeout(r, 18));
  }

  // Finish streaming and attach interactive rich card
  store.updateMessage(convId, assistantMsgId, {
    text: fullText,
    isStreaming: false,
    cardType: parsed.suggestedCardType,
    cardData: parsed.suggestedCardData,
  });

  // If intent was to run simulation now
  if (parsed.intent === 'run_simulation' && parsed.params?.taskId) {
    runTaskSimulation({
      taskId: parsed.params.taskId,
      conversationId: convId,
      messageId: assistantMsgId,
    });
  }
}

function mapGeminiDataToIntent(
  gData: any,
  originalText: string,
  context: { drops: any[]; stores: any[]; profiles: any[]; tasks: any[] }
): ParsedIntent {
  const intentName = gData.intent || 'general_chat';

  if (intentName === 'create_task') {
    const product = gData.product || 'Collectible';
    const store = gData.store || context.stores[0]?.name || 'VinylForge';
    const variant = gData.variant || 'One Size';
    const quantity = Number(gData.quantity) || 1;
    const maxPrice = Number(gData.maxPrice) || 300;
    const profile = gData.profile || context.profiles[0]?.name || 'Home (Primary)';
    const dropTime = gData.dropTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const matchedDrop = context.drops.find((d) =>
      d.name.toLowerCase().includes(product.toLowerCase())
    );

    const taskObj: BotTask = {
      id: 'task-' + Date.now(),
      productId: matchedDrop ? matchedDrop.id : 'drop-custom',
      productName: matchedDrop ? matchedDrop.name : product,
      storeName: store,
      variant,
      quantity,
      maxPrice,
      profileId: context.profiles[0]?.id || 'prof-home',
      profileName: profile,
      status: 'idle',
      dropTime,
      retries: 3,
    };

    return {
      intent: 'create_task',
      assistantText: `Extracted drop parameters for ${taskObj.productName}. Please confirm details below:`,
      suggestedCardType: 'task_preview',
      suggestedCardData: {
        task: taskObj,
        isConfirmed: false,
      },
    };
  }

  // Fallback to local parser mapping
  return parseUserMessage(originalText, context);
}
