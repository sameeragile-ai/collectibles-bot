import { DropItem, ShippingProfile, StoreProfile, BotTask } from '../../types';

export interface ParsedIntent {
  intent:
    | 'create_task'
    | 'manage_tasks'
    | 'list_drops'
    | 'task_status'
    | 'manage_profiles'
    | 'connect_store'
    | 'show_analytics'
    | 'show_logs'
    | 'run_simulation'
    | 'general_chat';
  params?: any;
  missingInfo?: string[];
  assistantText: string;
  suggestedCardType?:
    | 'task_preview'
    | 'task_run'
    | 'drops_list'
    | 'task_status'
    | 'profile_form'
    | 'profiles_list'
    | 'store_connect'
    | 'analytics'
    | 'logs';
  suggestedCardData?: any;
}

export function parseUserMessage(
  text: string,
  context: {
    drops: DropItem[];
    stores: StoreProfile[];
    profiles: ShippingProfile[];
    tasks: BotTask[];
  }
): ParsedIntent {
  const lower = text.toLowerCase().trim();

  // 1. Slash commands shortcuts
  if (lower.startsWith('/drops') || lower === 'drops') {
    return {
      intent: 'list_drops',
      assistantText: 'Here are the upcoming limited-edition drops scheduled across connected stores.',
      suggestedCardType: 'drops_list',
      suggestedCardData: { drops: context.drops },
    };
  }

  if (lower.startsWith('/stats') || lower.startsWith('/analytics')) {
    return {
      intent: 'show_analytics',
      assistantText: 'Here is your monthly purchasing bot performance overview and profit margins.',
      suggestedCardType: 'analytics',
    };
  }

  if (lower.startsWith('/logs') || lower.includes('show logs') || lower.includes('view logs')) {
    return {
      intent: 'show_logs',
      assistantText: 'Streaming recent proxy and task execution logs with millisecond precision.',
      suggestedCardType: 'logs',
    };
  }

  if (lower.startsWith('/profiles') || lower === 'show profiles' || lower === 'my profiles') {
    return {
      intent: 'manage_profiles',
      assistantText: 'Here are your active shipping and billing profiles.',
      suggestedCardType: 'profiles_list',
    };
  }

  if (lower.startsWith('/status') || lower === 'task status' || lower === 'check status') {
    const activeTask = context.tasks[0];
    return {
      intent: 'task_status',
      assistantText: `Currently monitoring ${context.tasks.filter((t) => t.status === 'monitoring').length} active drop(s).`,
      suggestedCardType: 'task_status',
      suggestedCardData: { task: activeTask },
    };
  }

  // 2. Manage tasks: Stop / Pause / Resume / Delete
  if (
    lower.includes('stop all') ||
    lower.includes('pause all') ||
    lower.includes('pause tasks') ||
    lower.includes('pause the') ||
    lower.includes('stop task') ||
    lower.includes('resume') ||
    lower.includes('delete task')
  ) {
    let action: 'pause' | 'resume' | 'delete' | 'stop' = 'pause';
    if (lower.includes('resume')) action = 'resume';
    if (lower.includes('delete')) action = 'delete';
    if (lower.includes('stop')) action = 'stop';

    let targetTask: BotTask | undefined;
    if (lower.includes('sneaker') || lower.includes('jordan')) {
      targetTask = context.tasks.find((t) => t.productName.toLowerCase().includes('jordan'));
    } else if (lower.includes('bear') || lower.includes('midnight')) {
      targetTask = context.tasks.find((t) => t.productName.toLowerCase().includes('bear'));
    } else if (lower.includes('dragon') || lower.includes('neon')) {
      targetTask = context.tasks.find((t) => t.productName.toLowerCase().includes('dragon'));
    }

    return {
      intent: 'manage_tasks',
      params: { action, target: targetTask ? targetTask.id : 'all' },
      assistantText: targetTask
        ? `${action === 'resume' ? 'Resumed' : action === 'delete' ? 'Deleted' : 'Paused'} task for ${targetTask.productName}.`
        : `${action === 'resume' ? 'Resumed' : 'Paused'} all active drop monitors across connected stores.`,
      suggestedCardType: 'task_status',
      suggestedCardData: { task: targetTask || context.tasks[0], isAll: !targetTask },
    };
  }

  // 3. Ask about drops
  if (
    lower.includes("what's dropping") ||
    lower.includes('what is dropping') ||
    lower.includes('upcoming drops') ||
    lower.includes('show drops') ||
    lower.includes('drops this week') ||
    lower.includes('what drops')
  ) {
    return {
      intent: 'list_drops',
      assistantText: "Here are the top drops scheduled this week across your connected stores. Tap 'Set up task' to arm any of them.",
      suggestedCardType: 'drops_list',
      suggestedCardData: { drops: context.drops },
    };
  }

  // 4. Connect store
  if (
    lower.includes('add my store') ||
    lower.includes('connect store') ||
    lower.includes('connect a store') ||
    lower.includes('add store') ||
    lower.includes('.com') ||
    lower.includes('.shop')
  ) {
    const urlMatch = text.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:com|co|shop|io|org)[^\s]*)/i);
    const storeUrl = urlMatch ? urlMatch[0] : 'https://grailed-drops.shop';
    const storeName = storeUrl
      .replace(/https?:\/\//, '')
      .split('.')[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      intent: 'connect_store',
      params: { url: storeUrl, name: storeName },
      assistantText: `Initiating handshake and anti-bot verification for ${storeName}...`,
      suggestedCardType: 'store_connect',
      suggestedCardData: { url: storeUrl, name: storeName },
    };
  }

  // 5. Add Profile
  if (
    lower.includes('add a new shipping profile') ||
    lower.includes('new shipping profile') ||
    lower.includes('add shipping profile') ||
    lower.includes('add profile') ||
    lower.includes('new profile')
  ) {
    return {
      intent: 'manage_profiles',
      params: { action: 'create' },
      assistantText: 'Fill out your shipping details below. Payment tokens are securely masked.',
      suggestedCardType: 'profile_form',
    };
  }

  // 6. Analytics / Stats
  if (
    lower.includes('results this month') ||
    lower.includes('my results') ||
    lower.includes('show stats') ||
    lower.includes('analytics') ||
    lower.includes('success rate') ||
    lower.includes('how much have i spent')
  ) {
    return {
      intent: 'show_analytics',
      assistantText: 'Summary for current billing cycle: 92.8% checkout success rate with an average latency of 412ms.',
      suggestedCardType: 'analytics',
    };
  }

  // 7. Check specific task status (e.g., "How's my Kaws task doing?", "Status of Midnight Bear")
  if (
    lower.includes('how is my') ||
    lower.includes("how's my") ||
    lower.includes('status of') ||
    lower.includes('check my')
  ) {
    let matchedTask = context.tasks.find((t) => {
      const p = t.productName.toLowerCase();
      return (
        (lower.includes('kaws') && p.includes('kaws')) ||
        (lower.includes('bear') && p.includes('bear')) ||
        (lower.includes('dragon') && p.includes('dragon')) ||
        (lower.includes('jordan') && p.includes('jordan'))
      );
    });

    if (!matchedTask) {
      // Find from drops catalog if task doesn't exist yet
      const matchedDrop = context.drops.find((d) => {
        const n = d.name.toLowerCase();
        return (
          (lower.includes('kaws') && n.includes('kaws')) ||
          (lower.includes('bear') && n.includes('bear')) ||
          (lower.includes('dragon') && n.includes('dragon')) ||
          (lower.includes('jordan') && n.includes('jordan'))
        );
      });

      if (matchedDrop) {
        return {
          intent: 'create_task',
          assistantText: `No active monitor was found for ${matchedDrop.name}, so I pre-configured a task preview for you below:`,
          suggestedCardType: 'task_preview',
          suggestedCardData: {
            task: {
              id: 'task-' + Date.now(),
              productId: matchedDrop.id,
              productName: matchedDrop.name,
              storeName: matchedDrop.storeName,
              variant: matchedDrop.sizes ? matchedDrop.sizes[0] : 'One Size',
              quantity: 1,
              maxPrice: matchedDrop.retailPrice * 1.2,
              profileId: context.profiles[0]?.id || 'prof-home',
              profileName: context.profiles[0]?.name || 'Home (Primary)',
              status: 'idle',
              dropTime: matchedDrop.dropTime,
              retries: 3,
            },
            isConfirmed: false,
          },
        };
      }

      matchedTask = context.tasks[0];
    }

    return {
      intent: 'task_status',
      assistantText: `Task for ${matchedTask.productName} is currently ${matchedTask.status} on ${matchedTask.storeName}.`,
      suggestedCardType: 'task_status',
      suggestedCardData: { task: matchedTask },
    };
  }

  // 8. Run drop simulation now (e.g. "Run Midnight Bear drop now", "Test drop simulation")
  if (
    lower.includes('run drop') ||
    lower.includes('run task') ||
    lower.includes('simulate drop') ||
    lower.includes('test drop') ||
    lower.includes('execute drop')
  ) {
    let target = context.tasks[0];
    if (lower.includes('dragon')) {
      target = context.tasks.find((t) => t.productName.toLowerCase().includes('dragon')) || target;
    } else if (lower.includes('jordan')) {
      target = context.tasks.find((t) => t.productName.toLowerCase().includes('jordan')) || target;
    } else if (lower.includes('bear')) {
      target = context.tasks.find((t) => t.productName.toLowerCase().includes('bear')) || target;
    }

    return {
      intent: 'run_simulation',
      params: { taskId: target.id },
      assistantText: `Triggering immediate drop execution cycle for ${target.productName}...`,
      suggestedCardType: 'task_run',
      suggestedCardData: { task: target },
    };
  }

  // 9. Create a task (e.g. "Buy 2 of the Neon Dragon card box when it drops tomorrow at 9am, max $180 each, use my home profile", "Watch the Midnight Bear figure drop Friday at 10am, size M, max $300")
  if (
    lower.includes('buy') ||
    lower.includes('watch') ||
    lower.includes('snipe') ||
    lower.includes('cop') ||
    lower.includes('order') ||
    lower.includes('task') ||
    lower.includes('get me')
  ) {
    // Match product against drops
    let matchedDrop = context.drops.find((d) => {
      const n = d.name.toLowerCase();
      if (lower.includes('midnight bear') || (lower.includes('bear') && n.includes('bear'))) return true;
      if (lower.includes('neon dragon') || (lower.includes('dragon') && n.includes('dragon'))) return true;
      if (lower.includes('jordan') || lower.includes('mocha') || (lower.includes('sneaker') && n.includes('jordan'))) return true;
      if (lower.includes('kaws') && n.includes('kaws')) return true;
      if (lower.includes('chrono') && n.includes('chrono')) return true;
      if (lower.includes('samurai') || lower.includes('ghostrunner')) return true;
      if (lower.includes('pokemon') || lower.includes('151')) return true;
      if (lower.includes('bearbrick') || lower.includes('karimoku')) return true;
      if (lower.includes('void walker')) return true;
      return false;
    });

    const productName = matchedDrop ? matchedDrop.name : 'Custom Collectible';
    const storeName = matchedDrop ? matchedDrop.storeName : context.stores[0]?.name || 'VinylForge';

    // Quantity extraction
    let quantity = 1;
    const qtyMatch = text.match(/(?:buy|cop|order|get|watch)\s+(\d+)(?:x|\s+of)?/i) || text.match(/(\d+)\s*(?:x|units?|boxes|pairs)/i);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10);
    }

    // Max price extraction
    let maxPrice = matchedDrop ? matchedDrop.retailPrice * 1.2 : 250;
    const priceMatch = text.match(/max\s*\$?(\d+)/i) || text.match(/\$?(\d+)(?:\s*(?:each|max|or less))/i);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1], 10);
    }

    // Variant / Size extraction
    let variant = matchedDrop && matchedDrop.sizes ? matchedDrop.sizes[0] : 'One Size';
    const sizeMatch = text.match(/size\s*([a-zA-Z0-9\.\s]+?)(?:,|$|\s+max|\s+use|\s+drop)/i) || text.match(/(?:us\s*)(\d+\.?\d*)/i);
    if (sizeMatch) {
      variant = sizeMatch[0].trim();
      if (!variant.toLowerCase().startsWith('size') && !variant.toLowerCase().startsWith('us')) {
        variant = `Size ${variant}`;
      }
    }

    // Profile extraction
    let profile = context.profiles.find((p) => p.isDefault) || context.profiles[0];
    if (lower.includes('studio')) {
      const found = context.profiles.find((p) => p.name.toLowerCase().includes('studio'));
      if (found) profile = found;
    } else if (lower.includes('home')) {
      const found = context.profiles.find((p) => p.name.toLowerCase().includes('home'));
      if (found) profile = found;
    }

    // Drop time extraction
    let dropTime = matchedDrop ? matchedDrop.dropTime : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    let dropDisplay = matchedDrop ? matchedDrop.dropDateDisplay : 'Friday at 10:00 AM';
    if (lower.includes('tomorrow')) dropDisplay = 'Tomorrow at 9:00 AM';
    if (lower.includes('friday')) dropDisplay = 'Friday at 10:00 AM';
    if (lower.includes('saturday')) dropDisplay = 'Saturday at 11:00 AM';

    // Check missing info (e.g. if user just says "Buy sneakers" or "Buy Jordan" with no size)
    const isSneakerWithoutSize = (lower.includes('sneaker') || lower.includes('jordan')) && !sizeMatch;
    if (isSneakerWithoutSize && matchedDrop) {
      return {
        intent: 'create_task',
        missingInfo: ['variant'],
        assistantText: `Found ${matchedDrop.name} on ${matchedDrop.storeName}. What shoe size and shipping profile should I lock in?`,
        params: {
          productName: matchedDrop.name,
          productId: matchedDrop.id,
          storeName: matchedDrop.storeName,
          quantity,
          maxPrice,
        },
      };
    }

    const newTaskPreview: BotTask = {
      id: 'task-' + Date.now(),
      productId: matchedDrop ? matchedDrop.id : 'drop-custom',
      productName,
      storeName,
      variant,
      quantity,
      maxPrice,
      profileId: profile.id,
      profileName: profile.name,
      status: 'idle',
      dropTime,
      retries: 3,
    };

    return {
      intent: 'create_task',
      params: newTaskPreview,
      assistantText: `Configured task for ${productName} on ${storeName}. Confirm parameters below to arm:`,
      suggestedCardType: 'task_preview',
      suggestedCardData: {
        task: newTaskPreview,
        isConfirmed: false,
      },
    };
  }

  // 10. Fallback crisp general response
  return {
    intent: 'general_chat',
    assistantText: `Ready. You can ask me to monitor a drop (e.g. "Buy 2 of the Neon Dragon box"), check running tasks, view weekly drops, or review your monthly stats.`,
  };
}
