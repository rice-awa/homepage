async page => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#activity').scrollIntoViewIfNeeded();
  await page.locator('#activity-calendar .activity-calendar').waitFor();
  await page.locator('#activity-calendar .activity-tooltip-slot').waitFor();

  const days = page.locator('#activity .activity-day');
  const dayCount = await days.count();
  if (dayCount < 6) {
    throw new Error(`expected at least six contribution days, found ${dayCount}`);
  }

  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    const slot = document.querySelector('#activity-calendar .activity-tooltip-slot');
    if (!slot) throw new Error('tooltip slot is missing');

    const events = [];
    const recordMotion = (event) => {
      if (event.target instanceof Element && event.target.matches('.activity-tooltip')) {
        events.push({ type: event.type, propertyName: event.propertyName || null });
      }
    };

    slot.addEventListener('animationstart', recordMotion, true);
    slot.addEventListener('transitionrun', recordMotion, true);
    window.__activityTooltipMotionEvents = events;
  });

  await days.nth(0).hover();
  await page.locator('#activity-calendar .activity-tooltip').waitFor();
  const initial = await page.evaluate(() => {
    const tooltip = document.querySelector('#activity-calendar .activity-tooltip');
    if (!tooltip) throw new Error('tooltip did not mount');

    window.__activityTooltipNode = tooltip;
    return {
      text: tooltip.textContent,
      connected: tooltip.isConnected,
    };
  });

  await page.waitForTimeout(220);
  const entranceMotion = await page.evaluate(() => ({
    animationStarts: window.__activityTooltipMotionEvents.filter((event) => event.type === 'animationstart').length,
    transitionRuns: window.__activityTooltipMotionEvents.filter((event) => event.type === 'transitionrun').length,
    total: window.__activityTooltipMotionEvents.length,
  }));

  if (!initial.connected || !initial.text) {
    throw new Error(`tooltip did not mount with readable content: ${JSON.stringify(initial)}`);
  }
  if (entranceMotion.animationStarts !== 0 || entranceMotion.transitionRuns === 0) {
    throw new Error(`tooltip entrance did not use only the starting transition: ${JSON.stringify(entranceMotion)}`);
  }

  let previousText = initial.text;
  const updates = [];

  for (let index = 1; index < 6; index += 1) {
    await days.nth(index).hover();
    await page.waitForFunction((text) => {
      const tooltip = document.querySelector('#activity-calendar .activity-tooltip');
      return Boolean(tooltip && tooltip.textContent !== text);
    }, previousText);

    const update = await page.evaluate(() => {
      const tooltip = document.querySelector('#activity-calendar .activity-tooltip');
      const initialNode = window.__activityTooltipNode;
      return {
        sameNode: tooltip === initialNode,
        connected: Boolean(initialNode?.isConnected),
        text: tooltip?.textContent || null,
      };
    });

    if (!update.sameNode || !update.connected || !update.text || update.text === previousText) {
      throw new Error(`tooltip node or text changed unexpectedly at adjacent update ${index}: ${JSON.stringify(update)}`);
    }

    previousText = update.text;
    updates.push(update);
  }

  await page.waitForTimeout(220);
  const finalMotion = await page.evaluate(() => ({
    animationStarts: window.__activityTooltipMotionEvents.filter((event) => event.type === 'animationstart').length,
    transitionRuns: window.__activityTooltipMotionEvents.filter((event) => event.type === 'transitionrun').length,
    total: window.__activityTooltipMotionEvents.length,
  }));

  if (finalMotion.total !== entranceMotion.total) {
    throw new Error(`adjacent tooltip updates restarted motion: entrance=${JSON.stringify(entranceMotion)}, final=${JSON.stringify(finalMotion)}`);
  }

  return { entranceMotion, finalMotion, updates };
}
