import { injectStyles } from './styles';
import { startObserver } from './observer';

function init(): void {
  injectStyles();
  startObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
