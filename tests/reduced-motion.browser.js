async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#mq1').waitFor();

  const initialTransform = await page.locator('#mq1').evaluate((element) => (
    getComputedStyle(element).transform
  ));

  await page.waitForTimeout(500);

  const state = await page.evaluate((beforeTransform) => {
    const marquee = document.querySelector('#mq1');
    const worksPin = document.querySelector('.works-pin');
    const animations = document.getAnimations().map((animation) => animation.animationName);
    const forbiddenAnimations = ['blink', 'wire', 'dragline', 'spin'];
    const sections = [...document.querySelectorAll('main > section')].map((section) => {
      const rect = section.getBoundingClientRect();
      return {
        id: section.id,
        width: rect.width,
        height: rect.height,
      };
    });

    return {
      marqueeTransform: marquee ? getComputedStyle(marquee).transform : null,
      animationNames: animations,
      forbiddenAnimations: animations.filter((name) => forbiddenAnimations.includes(name)),
      worksPosition: worksPin ? getComputedStyle(worksPin).position : null,
      hasPinSpacer: Boolean(document.querySelector('.pin-spacer')),
      opacities: {
        nav: getComputedStyle(document.querySelector('.nav')).opacity,
        heroCn: getComputedStyle(document.querySelector('.hero-cn')).opacity,
        heroFoot: getComputedStyle(document.querySelector('.hero-foot')).opacity,
      },
      sections,
      transformUnchanged: marquee ? getComputedStyle(marquee).transform === beforeTransform : false,
    };
  }, initialTransform);

  if (!state.transformUnchanged) {
    throw new Error(
      `reduced-motion marquee moved: before=${initialTransform}, after=${state.marqueeTransform}`,
    );
  }
  if (state.forbiddenAnimations.length > 0) {
    throw new Error(`reduced-motion decorative animations still running: ${state.forbiddenAnimations.join(', ')}`);
  }
  if (state.worksPosition === 'fixed' || state.hasPinSpacer) {
    throw new Error('reduced-motion Works is still pinned');
  }
  if (state.opacities.nav !== '1' || state.opacities.heroCn !== '1' || state.opacities.heroFoot !== '1') {
    throw new Error(`reduced-motion Hero visibility is incomplete: ${JSON.stringify(state.opacities)}`);
  }

  const emptySection = state.sections.find((section) => section.width === 0 || section.height === 0);
  if (emptySection) {
    throw new Error(`reduced-motion section has no layout box: ${JSON.stringify(emptySection)}`);
  }

  return state;
}
