<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  
  let show: boolean = false;
  
  function slideUp(
    node: HTMLElement,
    params: {
      delay?: number;
      duration?: number;
      easing?: (t: number) => number;
    } = {}
  ): {
    delay: number;
    duration: number;
    easing: (t: number) => number;
    css: (t: number) => string;
  } {
    return {
      delay: params.delay || 0,
      duration: params.duration || 300,
      easing: params.easing || cubicOut,
      css: (t: number) => `
        transform: translateY(${(1 - t) * 20}px);
        opacity: ${t};
      `
    };
  }
  
  onMount(() => {
    show = true;
  });
</script>

{#if show}
  <footer 
    class="py-2 bg-[#0a0a0b] border-t border-slate-800/50 text-slate-300"
    transition:slideUp|local
  >
    <div class="gap-4 max-w-6xl mx-auto px-6 flex flex-row justify-between items-center">
      <p class="text-xs sm:text-sm my-3 text-center md:text-left font-medium">
        &copy; {new Date().getFullYear()} 
        <a
          href="https://fitzsixto.com"
          target="_blank"
          rel="noopener"
          class="[text-shadow:0_0_8px_theme(colors.sky.400/0.6)] bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 bg-clip-text text-transparent font-bold transition-all ease-in-out duration-500 delay-300"
        >
          Fitzsixto 
        </a>. All rights reserved.
      </p>
      <div class="flex space-x-4">
        <a
          href="https://github.com/kulaizki/needleman-wunsch"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          class="flex items-center space-x-2 group"
        >
          <div class="w-10 h-10 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-sky-500/50 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <svg class="w-6 h-6 text-slate-400 group-hover:text-sky-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
        </a>
        <a
          href="https://ko-fi.com/kulaizki"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ko-fi"
          class="flex items-center space-x-2 group"
        >
          <div class="w-10 h-10 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-sky-500/50 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <svg class="w-6 h-6 text-slate-400 group-hover:text-sky-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
            </svg>
          </div>
        </a>
      </div>
    </div>
  </footer>
{/if}