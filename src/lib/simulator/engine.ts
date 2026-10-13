import { useDroplineStore } from '../../store/useDroplineStore';
import { BotTask, DropHistoryItem } from '../../types';
import confetti from 'canvas-confetti';

interface RunTaskOptions {
  taskId: string;
  conversationId?: string;
  messageId?: string;
  forceFail?: boolean;
}

export async function runTaskSimulation(options: RunTaskOptions) {
  const store = useDroplineStore.getState();
  const task = store.tasks.find((t) => t.id === options.taskId);
  if (!task) return;

  const convId = options.conversationId || store.activeConversationId;
  store.setRunningTaskId(task.id);

  const product = store.drops.find((d) => d.id === task.productId) || {
    name: task.productName,
    retailPrice: task.maxPrice,
    estResalePrice: task.maxPrice * 1.8,
  };

  // Helper to update both task in store and message card in conversation
  const updateProgress = (
    currentStep: BotTask['currentStep'],
    status: BotTask['status'],
    stepTiming: NonNullable<BotTask['stepTimingMs']>,
    extras?: { orderNumber?: string; failureReason?: string }
  ) => {
    store.updateTask(task.id, {
      status,
      currentStep,
      stepTimingMs: stepTiming,
      orderNumber: extras?.orderNumber,
      failureReason: extras?.failureReason,
    });

    if (convId && options.messageId) {
      store.updateMessage(convId, options.messageId, {
        cardData: {
          task: {
            ...task,
            status,
            currentStep,
            stepTimingMs: stepTiming,
            orderNumber: extras?.orderNumber,
            failureReason: extras?.failureReason,
          },
        },
      });
    }
  };

  // 1. Monitoring Phase
  const t0 = performance.now();
  store.addLog({
    level: 'INFO',
    taskId: task.id,
    productName: task.productName,
    message: `[Task ${task.id.slice(-6)}] Polling ${task.storeName} inventory stream at 120ms intervals.`,
  });

  const timing = {
    monitoring: 40 + Math.floor(Math.random() * 15),
    detected: 0,
    carted: 0,
    checkout: 0,
    total: 0,
  };

  updateProgress('monitoring', 'monitoring', timing);
  await new Promise((r) => setTimeout(r, 700));

  // 2. Item Detected Phase
  const t1 = performance.now();
  const detectedDelta = 42 + Math.floor(Math.random() * 20);
  timing.detected = detectedDelta;

  store.addLog({
    level: 'DETECT',
    taskId: task.id,
    productName: task.productName,
    message: `[Item Detected] SKU match found for "${task.variant}". Inventory payload verified.`,
    msDelta: detectedDelta,
  });

  updateProgress('item_detected', 'detected', timing);
  await new Promise((r) => setTimeout(r, 650));

  // 3. Added to Cart Phase
  const t2 = performance.now();
  const cartDelta = 115 + Math.floor(Math.random() * 35);
  timing.carted = cartDelta;

  store.addLog({
    level: 'CART',
    taskId: task.id,
    productName: task.productName,
    message: `[Cart Inject] Reserved ${task.quantity}x unit(s). Cart token acquired and cookies anchored.`,
    msDelta: cartDelta,
  });

  updateProgress('added_to_cart', 'carted', timing);
  await new Promise((r) => setTimeout(r, 750));

  // 4. Checking Out Phase
  const checkoutDelta = 175 + Math.floor(Math.random() * 45);
  timing.checkout = checkoutDelta;

  store.addLog({
    level: 'CHECKOUT',
    taskId: task.id,
    productName: task.productName,
    message: `[Checkout] Applying profile "${task.profileName}". Bypassing waiting room via custom session.`,
    msDelta: checkoutDelta,
  });

  updateProgress('checking_out', 'checking_out', timing);
  await new Promise((r) => setTimeout(r, 700));

  // 5. Outcome Phase (Secured or Failed)
  const isFailure = options.forceFail === true;
  timing.total = timing.detected + timing.carted + timing.checkout;

  if (!isFailure) {
    // Secured!
    const orderNum = `DL-${Math.floor(10000 + Math.random() * 89999)}`;
    updateProgress('secured', 'secured', timing, { orderNumber: orderNum });

    store.addLog({
      level: 'SUCCESS',
      taskId: task.id,
      productName: task.productName,
      message: `[Order Secured] Confirmed Order #${orderNum} in ${timing.total}ms total latency!`,
      msDelta: timing.total,
    });

    // Record in history
    const historyItem: DropHistoryItem = {
      id: 'hist-' + Date.now(),
      taskName: task.productName,
      productName: task.productName,
      storeName: task.storeName,
      variant: task.variant,
      retailPrice: product.retailPrice * task.quantity,
      resalePrice: product.estResalePrice * task.quantity,
      date: 'Just now',
      checkoutMs: timing.total,
      status: 'secured',
      orderId: orderNum,
    };
    store.addHistoryItem(historyItem);

    // Tasteful confetti burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FFB4A2', '#F78FB3', '#A29BFE', '#74B9FF'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore in test environments
    }

    // Add brief assistant confirmation message to chat
    if (convId) {
      store.addMessage(convId, {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: `Secured ${task.quantity}x ${task.productName} (${task.variant}) in ${timing.total}ms. Order #${orderNum} confirmed with profile "${task.profileName}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    store.addToast(
      'Order Secured!',
      `${task.quantity}x ${task.productName} bought in ${timing.total}ms.`,
      'success'
    );
  } else {
    // Failed
    const failReason = 'Inventory locked by concurrent bot cluster before gateway response.';
    updateProgress('failed', 'failed', timing, { failureReason: failReason });

    store.addLog({
      level: 'ERROR',
      taskId: task.id,
      productName: task.productName,
      message: `[Checkout Failed] ${failReason} Retries remaining: ${Math.max(0, task.retries - 1)}.`,
      msDelta: timing.total,
    });

    store.addToast(
      'Drop Missed',
      `Could not secure ${task.productName}: ${failReason}`,
      'error'
    );
  }

  store.setRunningTaskId(null);
}
