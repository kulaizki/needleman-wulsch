<script lang="ts">
  import { needlemanWunsch, type AlignmentResult } from '$lib/needlemanWunsch';
  
  let seq1 = $state('GATTACA');
  let seq2 = $state('GTCGACGCA');
  let matchScore = $state(1);
  let mismatchScore = $state(-1);
  let gapScore = $state(-2);
  
  let result = $state<AlignmentResult | null>(null);
  let hoveredCell = $state<[number, number] | null>(null);
  let showAlignment = $state(false);
  let tooltipPosition = $state({ x: 0, y: 0 });
  let showTooltip = $state(false);
  let tooltipTimeout: number | null = null;
  
  function runAlignment() {
    result = needlemanWunsch({
      seq1: seq1.toUpperCase(),
      seq2: seq2.toUpperCase(),
      matchScore,
      mismatchScore,
      gapScore
    });
    showAlignment = true;
  }
  
  function getCellClass(i: number, j: number): string {
    if (!result) return '';
    
    const isOnPath = result.traceback.some(([pi, pj]) => pi === i && pj === j);
    const isHovered = hoveredCell && hoveredCell[0] === i && hoveredCell[1] === j;
    
    // Special styling for origin
    if (i === 0 && j === 0) {
      return isOnPath 
        ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_20px_rgba(14,165,233,0.5)]' 
        : 'bg-slate-800/50 border-slate-700';
    }
    
    if (isOnPath) {
      return 'bg-gradient-to-br from-sky-500/30 to-blue-600/30 border-sky-400/50 text-sky-100 shadow-[0_0_15px_rgba(14,165,233,0.4)] scale-105';
    }
    if (isHovered) {
      return 'bg-slate-700/50 border-sky-400/30 scale-110 shadow-lg';
    }
    return 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600';
  }
  
  function getCellValue(i: number, j: number): string {
    if (!result) return '';
    return result.matrix[i][j].toString();
  }
  
  function getCellHeader(i: number, j: number): string {
    if (i === 0 && j === 0) return '';
    if (i === 0 && j > 0) return seq2[j - 1];
    if (j === 0 && i > 0) return seq1[i - 1];
    return '';
  }
  
  function getArrowDirection(i: number, j: number): string {
    if (!result || i === 0 || j === 0) return '';
    
    const isOnPath = result.traceback.some(([pi, pj]) => pi === i && pj === j);
    if (!isOnPath) return '';
    
    const currentIndex = result.traceback.findIndex(([pi, pj]) => pi === i && pj === j);
    if (currentIndex === -1 || currentIndex === 0) return '';
    
    const [nextI, nextJ] = result.traceback[currentIndex - 1];
    
    if (nextI === i - 1 && nextJ === j - 1) return '↖';
    if (nextI === i - 1 && nextJ === j) return '↑';
    if (nextI === i && nextJ === j - 1) return '←';
    
    return '';
  }
  
  function getCellTooltip(i: number, j: number): string {
    if (!result) return '';
    
    if (i === 0 && j === 0) {
      return 'Starting cell\nInitial score: 0';
    }
    
    if (i === 0 && j > 0) {
      return `Gap penalty accumulation\n${j} gaps × ${gapScore} = ${result.matrix[i][j]}`;
    }
    
    if (j === 0 && i > 0) {
      return `Gap penalty accumulation\n${i} gaps × ${gapScore} = ${result.matrix[i][j]}`;
    }
    
    const diagonal = result.matrix[i - 1][j - 1];
    const up = result.matrix[i - 1][j];
    const left = result.matrix[i][j - 1];
    
    const char1 = seq1[i - 1];
    const char2 = seq2[j - 1];
    const isMatch = char1 === char2;
    const scoreType = isMatch ? `Match (${char1} = ${char2})` : `Mismatch (${char1} ≠ ${char2})`;
    const scoreValue = isMatch ? matchScore : mismatchScore;
    
    const diagonalScore = diagonal + scoreValue;
    const upScore = up + gapScore;
    const leftScore = left + gapScore;
    
    const currentScore = result.matrix[i][j];
    
    return `Score from Diagonal cell: ${diagonal} + ${scoreValue} (${scoreType}) = ${diagonalScore}
Score from Upper cell: ${up} + ${gapScore} (Gap score) = ${upScore}
Score from Side cell: ${left} + ${gapScore} (Gap score) = ${leftScore}
Winning (max) score is ${currentScore}`;
  }
  
  function handleCellMouseEnter(e: MouseEvent, i: number, j: number) {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    hoveredCell = [i, j];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipPosition = { x: rect.left + rect.width / 2, y: rect.top - 10 };
    tooltipTimeout = window.setTimeout(() => {
      showTooltip = true;
    }, 100);
  }
  
  function handleCellMouseLeave() {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
    hoveredCell = null;
    showTooltip = false;
  }
</script>

<div class="min-h-screen bg-[#0a0a0b] relative overflow-hidden">
  <!-- Grid background pattern -->
  <div class="absolute inset-0 grid-pattern"></div>
  
  <!-- Ambient lighting effects -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="ambient-light bg-sky-500/20 -top-40 -right-40 animate-float"></div>
    <div class="ambient-light bg-blue-500/20 -bottom-40 -left-40 animate-float" style="animation-delay: 2s;"></div>
    <div class="ambient-light bg-sky-400/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"></div>
  </div>
  
  <div class="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <header class="text-center mb-8 md:mb-16 animate-fadeIn">
      <div class="inline-block">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight gradient-text glow-text">
          Needleman-Wunsch
        </h1>
        <div class="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-sky-500 to-transparent rounded-full"></div>
      </div>
      <p class="text-lg md:text-xl text-slate-400 font-medium mt-4 md:mt-6 px-4">
        Interactive Global Sequence Alignment Visualization
      </p>
    </header>
    
    <!-- Main content grid -->
    <div class="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
      <!-- Input Panel -->
      <div class="glass-card rounded-2xl p-6 md:p-8 animate-slideUp border-slate-700/50 hover:border-sky-500/20 transition-all duration-300">
        <div class="flex items-center gap-4 mb-6 md:mb-8">
          <div class="relative">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span class="text-white font-bold text-sm md:text-lg">01</span>
            </div>
            <div class="absolute inset-0 bg-sky-500/20 rounded-xl blur-xl"></div>
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-100">Input Parameters</h2>
        </div>
        
        <div class="space-y-4 md:space-y-6">
          <!-- Sequence inputs -->
          <div class="space-y-4 md:space-y-5">
            <div class="group">
              <label for="seq1" class="block text-xs font-bold text-sky-400 mb-2 uppercase tracking-wider">
                Sequence 1
              </label>
              <div class="relative">
                <input
                  id="seq1"
                  type="text"
                  bind:value={seq1}
                  class="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-800/50 backdrop-blur border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 uppercase font-mono text-base md:text-lg font-medium placeholder-slate-500 text-slate-100 hover:border-slate-600"
                  placeholder="ENTER FIRST SEQUENCE"
                />
                <div class="absolute inset-0 bg-sky-500/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            <div class="group">
              <label for="seq2" class="block text-xs font-bold text-sky-400 mb-2 uppercase tracking-wider">
                Sequence 2
              </label>
              <div class="relative">
                <input
                  id="seq2"
                  type="text"
                  bind:value={seq2}
                  class="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-800/50 backdrop-blur border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 uppercase font-mono text-base md:text-lg font-medium placeholder-slate-500 text-slate-100 hover:border-slate-600"
                  placeholder="ENTER SECOND SEQUENCE"
                />
                <div class="absolute inset-0 bg-sky-500/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>
          
          <!-- Score inputs -->
          <div class="grid grid-cols-3 gap-3 md:gap-4 pt-2">
            <div class="group">
              <label for="match" class="block text-xs font-bold text-sky-400 mb-2 uppercase tracking-wider">
                Match
              </label>
              <input
                id="match"
                type="number"
                bind:value={matchScore}
                class="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-800/50 backdrop-blur border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-center font-bold text-slate-100 hover:border-slate-600"
              />
            </div>
            
            <div class="group">
              <label for="mismatch" class="block text-xs font-bold text-sky-400 mb-2 uppercase tracking-wider">
                Mismatch
              </label>
              <input
                id="mismatch"
                type="number"
                bind:value={mismatchScore}
                class="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-800/50 backdrop-blur border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-center font-bold text-slate-100 hover:border-slate-600"
              />
            </div>
            
            <div class="group">
              <label for="gap" class="block text-xs font-bold text-sky-400 mb-2 uppercase tracking-wider">
                Gap
              </label>
              <input
                id="gap"
                type="number"
                bind:value={gapScore}
                class="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-800/50 backdrop-blur border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-center font-bold text-slate-100 hover:border-slate-600"
              />
            </div>
          </div>
          
          <!-- Run button -->
          <button
            onclick={runAlignment}
            class="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3 px-5 md:py-4 md:px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-sky-500/25 flex items-center justify-center gap-3 text-base md:text-lg neon-button relative overflow-hidden"
          >
            <span class="relative z-10">Run Alignment</span>
            <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Results Panel -->
      {#if result && showAlignment}
        <div class="glass-card rounded-2xl p-6 md:p-8 animate-slideUp border-slate-700/50 hover:border-sky-500/20 transition-all duration-300" style="animation-delay: 0.1s;">
          <div class="flex items-center gap-4 mb-6 md:mb-8">
            <div class="relative">
              <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span class="text-white font-bold text-sm md:text-lg">02</span>
              </div>
              <div class="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl"></div>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-slate-100">Alignment Result</h2>
          </div>
          
          <div class="space-y-4 md:space-y-6">
            <!-- Aligned sequences -->
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-4 md:p-6 border border-slate-700/50">
              <h3 class="text-xs font-bold text-emerald-400 mb-3 md:mb-4 uppercase tracking-wider">Aligned Sequences</h3>
              <div class="font-mono text-sm md:text-lg space-y-2 md:space-y-3 overflow-x-auto">
                <div class="flex items-start gap-2 md:gap-4">
                  <span class="text-slate-500 font-semibold w-12 md:w-14 shrink-0">Seq1:</span>
                  <span class="text-sky-300 tracking-wider font-bold break-all">{result.alignedSeq1}</span>
                </div>
                <div class="flex items-start gap-2 md:gap-4">
                  <span class="text-slate-500 font-semibold w-12 md:w-14 shrink-0">Seq2:</span>
                  <span class="text-sky-300 tracking-wider font-bold break-all">{result.alignedSeq2}</span>
                </div>
              </div>
            </div>
            
            <!-- Score display -->
            <div class="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-xl p-4 md:p-6 border border-emerald-500/20">
              <h3 class="text-xs font-bold text-emerald-400 mb-2 md:mb-3 uppercase tracking-wider">Alignment Score</h3>
              <div class="flex items-center gap-3 md:gap-4">
                <p class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{result.score}</p>
                <div class="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="width: {Math.min(100, (result.score + 20) * 2)}%"></div>
                </div>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="bg-slate-800/30 rounded-xl p-3 md:p-4 space-y-2 border border-slate-700/50">
              <h3 class="text-xs font-bold text-sky-400 mb-2 md:mb-3 uppercase tracking-wider">Matrix Legend</h3>
              <div class="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                <div class="flex items-center gap-2 md:gap-3">
                  <div class="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-sky-500/30 to-blue-600/30 rounded border border-sky-400/50 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                  <span class="text-slate-400">Optimal path</span>
                </div>
                <div class="flex items-center gap-2 md:gap-3">
                  <div class="w-3 h-3 md:w-4 md:h-4 bg-sky-500/20 rounded border border-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                  <span class="text-slate-400">Starting cell</span>
                </div>
                <div class="flex items-center gap-2 md:gap-3">
                  <div class="w-3 h-3 md:w-4 md:h-4 bg-slate-800/30 rounded border border-slate-700/50"></div>
                  <span class="text-slate-400">Regular cell</span>
                </div>
                <div class="flex items-center gap-2 md:gap-3">
                  <div class="w-3 h-3 md:w-4 md:h-4 bg-slate-700/50 rounded border border-sky-400/30"></div>
                  <span class="text-slate-400">Hovered cell</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Matrix visualization -->
    {#if result && showAlignment}
      <div class="glass-card rounded-2xl p-4 md:p-8 animate-slideUp border-slate-700/50 hover:border-sky-500/20 transition-all duration-300" style="animation-delay: 0.2s;">
        <div class="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div class="relative">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span class="text-white font-bold text-sm md:text-lg">03</span>
            </div>
            <div class="absolute inset-0 bg-purple-500/20 rounded-xl blur-xl"></div>
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-100">Dynamic Programming Matrix</h2>
        </div>
        
        <div class="overflow-x-auto -mx-4 px-4">
          <div class="inline-block min-w-full">
            <table class="mx-auto">
              <tbody>
                <!-- Header row -->
                <tr>
                  <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"></td>
                  <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"></td>
                  {#each seq2 as char}
                    <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-center">
                      <div class="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 text-sky-300 font-bold rounded-lg md:rounded-xl flex items-center justify-center text-sm sm:text-base md:text-lg shadow-lg border border-slate-600/50">
                        {char}
                      </div>
                    </td>
                  {/each}
                </tr>
                
                <!-- First data row -->
                <tr>
                  <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"></td>
                  {#each result.matrix[0] as val, j}
                    <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
                      <div 
                        class="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto border rounded-lg md:rounded-xl flex items-center justify-center font-bold transition-all duration-200 cursor-pointer matrix-cell {getCellClass(0, j)}"
                        onmouseenter={(e) => handleCellMouseEnter(e, 0, j)}
                        onmouseleave={handleCellMouseLeave}
                      >
                        <span class="text-sm sm:text-base md:text-lg">{val}</span>
                      </div>
                    </td>
                  {/each}
                </tr>
                
                <!-- Remaining rows -->
                {#each result.matrix.slice(1) as row, i}
                  <tr>
                    <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-center">
                      <div class="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 text-sky-300 font-bold rounded-lg md:rounded-xl flex items-center justify-center text-sm sm:text-base md:text-lg shadow-lg border border-slate-600/50">
                        {seq1[i]}
                      </div>
                    </td>
                    {#each row as val, j}
                      {@const actualI = i + 1}
                      {@const actualJ = j}
                      <td class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
                        <div
                          class="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto border rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative matrix-cell {getCellClass(actualI, actualJ)}"
                          onmouseenter={(e) => handleCellMouseEnter(e, actualI, actualJ)}
                          onmouseleave={handleCellMouseLeave}
                        >
                          <span class="font-bold text-sm sm:text-base md:text-lg">{val}</span>
                          {#if getArrowDirection(actualI, actualJ)}
                            <span class="absolute top-0.5 left-0.5 md:top-1 md:left-1 text-[10px] sm:text-[11px] md:text-xs text-sky-400 opacity-80">{getArrowDirection(actualI, actualJ)}</span>
                          {/if}
                        </div>
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Mobile instruction -->
        <div class="mt-4 text-center text-xs text-slate-500 md:hidden">
          <p>Scroll horizontally to view the full matrix</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Modern Tooltip -->
{#if showTooltip && hoveredCell && result}
  <div 
    class="fixed z-50 glass-card text-xs md:text-sm rounded-xl py-3 px-4 md:py-4 md:px-5 pointer-events-none whitespace-pre-line shadow-2xl border border-sky-500/20 transition-opacity duration-150"
    style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px; transform: translate(-50%, -100%); min-width: 280px; max-width: 340px; background: rgba(17, 17, 19, 0.95); color: #e2e8f0;"
  >
    <div class="font-medium leading-relaxed text-slate-200">{getCellTooltip(hoveredCell[0], hoveredCell[1])}</div>
    <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
      <div class="w-0 h-0 border-l-6 md:border-l-8 border-r-6 md:border-r-8 border-t-6 md:border-t-8 border-transparent" style="border-top-color: rgba(17, 17, 19, 0.95);"></div>
    </div>
  </div>
{/if}