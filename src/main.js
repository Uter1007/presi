import Reveal from 'reveal.js';
import RevealMarkdown from 'reveal.js/plugin/markdown/markdown';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight';

async function loadIncludes() {
    const sections = document.querySelectorAll('[data-include]');
  
    for (const section of sections) {
      const file = section.getAttribute('data-include');
  
      try {
        const response = await fetch(file);
  
        if (response.ok) {
          const content = await response.text();
          section.innerHTML = content;
        } else {
          console.error(`Error loading ${file}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  loadIncludes().then(() => {
    Reveal.initialize({
      hash: true,
      margin: 0.05,
      plugins: [RevealMarkdown, RevealHighlight],
    });
});
