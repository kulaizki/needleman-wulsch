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
    
    // Special color for origin (0,0)
    if (i === 0 && j === 0) return isOnPath ? 'bg-emerald-500 text-white font-bold shadow-lg' : 'bg-emerald-50 border-emerald-200';
    
    if (isOnPath) return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-105';
    if (isHovered) return 'bg-indigo-100 scale-110 shadow-md';
    return 'hover:bg-slate-50 hover:scale-105';
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
    
    // Check if this cell is on the traceback path
    const isOnPath = result.traceback.some(([pi, pj]) => pi === i && pj === j);
    if (!isOnPath) return '';
    
    // Find the next cell in the traceback path
    const currentIndex = result.traceback.findIndex(([pi, pj]) => pi === i && pj === j);
    if (currentIndex === -1 || currentIndex === 0) return '';
    
    const [nextI, nextJ] = result.traceback[currentIndex - 1];
    
    if (nextI === i - 1 && nextJ === j - 1) return '↖'; // diagonal
    if (nextI === i - 1 && nextJ === j) return '↑'; // up
    if (nextI === i && nextJ === j - 1) return '←'; // left
    
    return '';
  }
  
  function getCellTooltip(i: number, j: number): string {
    if (!result) return '';
    
    // Special case for (0,0)
    if (i === 0 && j === 0) {
      return 'Starting cell\nInitial score: 0';
    }
    
    // First row (horizontal gaps)
    if (i === 0 && j > 0) {
      return `Gap penalty accumulation\n${j} gaps × ${gapScore} = ${result.matrix[i][j]}`;
    }
    
    // First column (vertical gaps)
    if (j === 0 && i > 0) {
      return `Gap penalty accumulation\n${i} gaps × ${gapScore} = ${result.matrix[i][j]}`;
    }
    
    // Regular cells
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
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
  <!-- Decorative background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style="animation-delay: 1s;"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style="animation-delay: 2s;"></div>
  </div>
  
  <div class="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <header class="text-center mb-12 animate-fadeIn">
      <h1 class="text-6xl font-black mb-4 tracking-tight">
        <span class="gradient-text">Needleman-Wunsch</span>
      </h1>
      <p class="text-xl text-slate-600 font-medium">
        Interactive Global Sequence Alignment Visualization
      </p>
    </header>
    
    <!-- Main content grid -->
    <div class="grid lg:grid-cols-2 gap-8 mb-12">
      <!-- Input Panel -->
      <div class="glass-card rounded-2xl p-8 animate-slideUp">
        <h2 class="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
          <span class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">01</span>
          Input Parameters
        </h2>
        
        <div class="space-y-6">
          <!-- Sequence inputs -->
          <div class="space-y-4">
            <div class="group">
              <label for="seq1" class="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">
                Sequence 1
              </label>
              <div class="relative">
                <input
                  id="seq1"
                  type="text"
                  bind:value={seq1}
                  class="w-full px-5 py-4 bg-white/70 backdrop-blur border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 uppercase font-mono text-lg font-medium placeholder-slate-400 shadow-sm"
                  placeholder="ENTER FIRST SEQUENCE"
                />
              </div>
            </div>
            
            <div class="group">
              <label for="seq2" class="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">
                Sequence 2
              </label>
              <div class="relative">
                <input
                  id="seq2"
                  type="text"
                  bind:value={seq2}
                  class="w-full px-5 py-4 bg-white/70 backdrop-blur border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 uppercase font-mono text-lg font-medium placeholder-slate-400 shadow-sm"
                  placeholder="ENTER SECOND SEQUENCE"
                />
              </div>
            </div>
          </div>
          
          <!-- Score inputs -->
          <div class="grid grid-cols-3 gap-4 pt-4">
            <div class="group">
              <label for="match" class="block text-xs font-semibold text-slate-700 mb-2 tracking-wide uppercase">
                Match Score
              </label>
              <input
                id="match"
                type="number"
                bind:value={matchScore}
                class="w-full px-4 py-3 bg-white/70 backdrop-blur border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-center font-semibold text-slate-800 shadow-sm"
              />
            </div>
            
            <div class="group">
              <label for="mismatch" class="block text-xs font-semibold text-slate-700 mb-2 tracking-wide uppercase">
                Mismatch Score
              </label>
              <input
                id="mismatch"
                type="number"
                bind:value={mismatchScore}
                class="w-full px-4 py-3 bg-white/70 backdrop-blur border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-center font-semibold text-slate-800 shadow-sm"
              />
            </div>
            
            <div class="group">
              <label for="gap" class="block text-xs font-semibold text-slate-700 mb-2 tracking-wide uppercase">
                Gap Score
              </label>
              <input
                id="gap"
                type="number"
                bind:value={gapScore}
                class="w-full px-4 py-3 bg-white/70 backdrop-blur border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-center font-semibold text-slate-800 shadow-sm"
              />
            </div>
          </div>
          
          <!-- Run button -->
          <button
            onclick={runAlignment}
            class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 text-lg"
          >
            <span>Run Alignment</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Results Panel -->
      {#if result && showAlignment}
        <div class="glass-card rounded-2xl p-8 animate-slideUp" style="animation-delay: 0.1s;">
          <h2 class="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
            <span class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">02</span>
            Alignment Result
          </h2>
          
          <div class="space-y-6">
            <!-- Aligned sequences -->
            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 class="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Aligned Sequences</h3>
              <div class="font-mono text-lg space-y-3">
                <div class="flex items-start gap-4">
                  <span class="text-slate-500 font-semibold w-14">Seq1:</span>
                  <span class="text-slate-800 tracking-wider font-bold break-all">{result.alignedSeq1}</span>
                </div>
                <div class="flex items-start gap-4">
                  <span class="text-slate-500 font-semibold w-14">Seq2:</span>
                  <span class="text-slate-800 tracking-wider font-bold break-all">{result.alignedSeq2}</span>
                </div>
              </div>
            </div>
            
            <!-- Score display -->
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Alignment Score</h3>
              <div class="flex items-center gap-4">
                <p class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{result.score}</p>
                <div class="flex-1 h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style="width: {Math.min(100, (result.score + 20) * 2)}%"></div>
                </div>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="bg-slate-50 rounded-xl p-4 space-y-2">
              <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Matrix Legend</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded shadow-md"></div>
                  <span class="text-slate-600">Optimal path</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-emerald-500 rounded shadow-md"></div>
                  <span class="text-slate-600">Starting cell</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-slate-200 rounded border border-slate-300"></div>
                  <span class="text-slate-600">Regular cell</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-indigo-100 rounded border border-indigo-200"></div>
                  <span class="text-slate-600">Hovered cell</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Matrix visualization -->
    {#if result && showAlignment}
      <div class="glass-card rounded-2xl p-8 animate-slideUp" style="animation-delay: 0.2s;">
        <h2 class="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
          <span class="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">03</span>
          Dynamic Programming Matrix
        </h2>
        
        <div class="overflow-x-auto -mx-4 px-4">
          <div class="inline-block min-w-full">
            <table class="mx-auto">
              <tbody>
                <!-- Header row -->
                <tr>
                  <td class="w-20 h-20"></td>
                  <td class="w-20 h-20"></td>
                  {#each seq2 as char}
                    <td class="w-20 h-20 text-center">
                      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 text-white font-bold rounded-xl flex items-center justify-center text-lg shadow-lg">
                        {char}
                      </div>
                    </td>
                  {/each}
                </tr>
                
                <!-- First data row -->
                <tr>
                  <td class="w-20 h-20"></td>
                  {#each result.matrix[0] as val, j}
                    <td class="w-20 h-20">
                      <div 
                        class="w-16 h-16 mx-auto border-2 rounded-xl flex items-center justify-center font-bold transition-all duration-200 cursor-pointer matrix-cell {getCellClass(0, j)}"
                        onmouseenter={(e) => {
                          hoveredCell = [0, j];
                          const rect = e.currentTarget.getBoundingClientRect();
                          tooltipPosition = { x: rect.left + rect.width / 2, y: rect.top - 10 };
                          showTooltip = true;
                        }}
                        onmouseleave={() => {
                          hoveredCell = null;
                          showTooltip = false;
                        }}
                      >
                        {val}
                      </div>
                    </td>
                  {/each}
                </tr>
                
                <!-- Remaining rows -->
                {#each result.matrix.slice(1) as row, i}
                  <tr>
                    <td class="w-20 h-20 text-center">
                      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 text-white font-bold rounded-xl flex items-center justify-center text-lg shadow-lg">
                        {seq1[i]}
                      </div>
                    </td>
                    {#each row as val, j}
                      {@const actualI = i + 1}
                      {@const actualJ = j}
                      <td class="w-20 h-20">
                        <div
                          class="w-16 h-16 mx-auto border-2 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative matrix-cell {getCellClass(actualI, actualJ)}"
                          onmouseenter={(e) => {
                            hoveredCell = [actualI, actualJ];
                            const rect = e.currentTarget.getBoundingClientRect();
                            tooltipPosition = { x: rect.left + rect.width / 2, y: rect.top - 10 };
                            showTooltip = true;
                          }}
                          onmouseleave={() => {
                            hoveredCell = null;
                            showTooltip = false;
                          }}
                        >
                          <span class="font-bold text-lg">{val}</span>
                          {#if getArrowDirection(actualI, actualJ)}
                            <span class="absolute top-1 left-1 text-xs opacity-70">{getArrowDirection(actualI, actualJ)}</span>
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
      </div>
    {/if}
  </div>
</div>

<!-- Modern Tooltip -->
{#if showTooltip && hoveredCell && result}
  <div 
    class="fixed z-50 glass-card text-sm rounded-xl py-4 px-5 pointer-events-none whitespace-pre-line shadow-2xl border border-white/20 animate-fadeIn"
    style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px; transform: translate(-50%, -100%); min-width: 340px; background: rgba(15, 23, 42, 0.95); color: white;"
  >
    <div class="font-medium leading-relaxed">{getCellTooltip(hoveredCell[0], hoveredCell[1])}</div>
    <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
      <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent" style="border-top-color: rgba(15, 23, 42, 0.95);"></div>
    </div>
  </div>
{/if}