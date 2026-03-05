const BRAND_COLOR = 'rgb(120, 86, 255)';
const BRAND_COLOR_BG = 'rgba(120, 86, 255, 0.1)';
const ICON_GRAY = 'rgb(113, 118, 123)';

let styleInjected = false;

export function injectStyles(): void {
  if (styleInjected) return;
  styleInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    .gifage-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      position: relative;
    }

    .gifage-btn-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: color 0.2s ease;
    }

    .gifage-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34.75px;
      height: 34.75px;
      border-radius: 50%;
      transition: background-color 0.2s ease;
    }

    .gifage-btn:hover .gifage-icon-wrap {
      background-color: ${BRAND_COLOR_BG};
    }

    .gifage-btn svg {
      width: 18.75px;
      height: 18.75px;
      fill: ${ICON_GRAY};
      transition: fill 0.2s ease;
    }

    .gifage-btn:hover svg {
      fill: ${BRAND_COLOR};
    }

    .gifage-btn[data-gifage-saved="true"] svg {
      fill: ${BRAND_COLOR};
    }

    .gifage-toast {
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      padding: 6px 10px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 10000;
    }

    .gifage-toast-success {
      background-color: #00BA7C;
    }

    .gifage-toast-error {
      background-color: #F4212E;
    }

    .gifage-toast-info {
      background-color: #1D9BF0;
    }

    .gifage-toast.gifage-toast-visible {
      opacity: 1;
    }

    .gifage-tooltip {
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(91, 112, 131, 0.8);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 400;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 2px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 9999;
    }

    .gifage-btn:hover .gifage-tooltip {
      opacity: 1;
    }

    .gifage-btn:hover .gifage-toast.gifage-toast-visible ~ .gifage-tooltip {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}

export { BRAND_COLOR, ICON_GRAY };
