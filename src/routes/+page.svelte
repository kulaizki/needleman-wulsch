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
  
  function runAlignment() {
    result = needlemanWunsch({
      seq1: seq1.toUpperCase(),
      seq2: seq2.toUpperCase(),
      matchScore,
      mismatchScore,
      gapScore
    });
    showAlignment = true;
    
    // Debug: log the traceback path
    console.log('Traceback path:');
    result.traceback.forEach(([i, j], index) => {
      const char1 = i > 0 ? seq1[i-1] : '-';
      const char2 = j > 0 ? seq2[j-1] : '-';
      console.log(`Step ${index}: (${i},${j}) = ${result.matrix[i][j]} [${char1},${char2}]`);
    });
    console.log('Aligned seq1:', result.alignedSeq1);
    console.log('Aligned seq2:', result.alignedSeq2);
  }
  
  function getCellClass(i: number, j: number): string {
    if (!result) return '';
    
    const isOnPath = result.traceback.some(([pi, pj]) => pi === i && pj === j);
    const isHovered = hoveredCell && hoveredCell[0] === i && hoveredCell[1] === j;
    
    // Special color for origin (0,0)
    if (i === 0 && j === 0) return isOnPath ? 'bg-green-500 text-white font-bold' : 'bg-green-100';
    
    if (isOnPath) return 'bg-rose-500 text-white';
    if (isHovered) return 'bg-blue-200';
    return 'hover:bg-gray-50';
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
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
  <div class="max-w-7xl mx-auto">
    <header class="text-center mb-12">
      <h1 class="text-5xl font-bold text-gray-900 mb-4">
        Needleman-Wunsch Algorithm
      </h1>
      <p class="text-xl text-gray-600">
        Interactive Global Sequence Alignment Visualization
      </p>
    </header>
    
    <div class="grid md:grid-cols-2 gap-8 mb-12">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Input Parameters</h2>
        
        <div class="space-y-6">
          <div>
            <label for="seq1" class="block text-sm font-medium text-gray-700 mb-2">
              Sequence 1
            </label>
            <input
              id="seq1"
              type="text"
              bind:value={seq1}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase font-mono text-lg"
              placeholder="Enter first sequence"
            />
          </div>
          
          <div>
            <label for="seq2" class="block text-sm font-medium text-gray-700 mb-2">
              Sequence 2
            </label>
            <input
              id="seq2"
              type="text"
              bind:value={seq2}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase font-mono text-lg"
              placeholder="Enter second sequence"
            />
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label for="match" class="block text-sm font-medium text-gray-700 mb-2">
                Match Score
              </label>
              <input
                id="match"
                type="number"
                bind:value={matchScore}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label for="mismatch" class="block text-sm font-medium text-gray-700 mb-2">
                Mismatch Score
              </label>
              <input
                id="mismatch"
                type="number"
                bind:value={mismatchScore}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label for="gap" class="block text-sm font-medium text-gray-700 mb-2">
                Gap Score
              </label>
              <input
                id="gap"
                type="number"
                bind:value={gapScore}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <button
            onclick={runAlignment}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Run Alignment
          </button>
        </div>
      </div>
      
      {#if result && showAlignment}
        <div class="bg-white rounded-xl shadow-lg p-8 animate-fadeIn">
          <h2 class="text-2xl font-semibold mb-6 text-gray-800">Alignment Result</h2>
          
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-3">Aligned Sequences</h3>
              <div class="font-mono text-lg space-y-2">
                <div class="flex items-center gap-3">
                  <span class="text-gray-600 w-12">Seq1:</span>
                  <span class="text-gray-900 tracking-wider">{result.alignedSeq1}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-gray-600 w-12">Seq2:</span>
                  <span class="text-gray-900 tracking-wider">{result.alignedSeq2}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Alignment Score</h3>
              <p class="text-3xl font-bold text-green-700">{result.score}</p>
            </div>
            
            <div class="text-sm text-gray-600 space-y-1">
              <p>• Hover over matrix cells to explore values</p>
              <p>• Red cells show the optimal alignment path</p>
              <p>• Blue cells represent sequence characters</p>
              <p>• Arrows (↖ ↑ ←) indicate traceback direction</p>
              <p>• Score in each cell shows the optimal alignment score up to that point</p>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    {#if result && showAlignment}
      <div class="bg-white rounded-xl shadow-lg p-8 animate-slideUp">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Dynamic Programming Matrix</h2>
        
        <div class="overflow-x-auto">
          <table class="mx-auto border-collapse">
            <tbody>
              <!-- Header row -->
              <tr>
                <td class="border border-gray-300 w-16 h-16 bg-gray-200"></td>
                <td class="border border-gray-300 w-16 h-16 bg-gray-200"></td>
                {#each seq2 as char}
                  <td class="border border-gray-300 w-16 h-16 text-center bg-blue-500 text-white font-bold">
                    {char}
                  </td>
                {/each}
              </tr>
              
              <!-- First data row (with gap penalties) -->
              <tr>
                <td class="border border-gray-300 w-16 h-16 bg-gray-200"></td>
                {#each result.matrix[0] as val, j}
                  <td 
                    class="border border-gray-300 w-16 h-16 text-center font-bold transition-all duration-200 cursor-pointer {getCellClass(0, j)}"
                    onmouseenter={() => hoveredCell = [0, j]}
                    onmouseleave={() => hoveredCell = null}
                  >
                    {val}
                  </td>
                {/each}
              </tr>
              
              <!-- Remaining rows -->
              {#each result.matrix.slice(1) as row, i}
                <tr>
                  <td class="border border-gray-300 w-16 h-16 text-center bg-blue-500 text-white font-bold">
                    {seq1[i]}
                  </td>
                  {#each row as val, j}
                    {@const actualI = i + 1}
                    {@const actualJ = j}
                    <td
                      class="border border-gray-300 w-16 h-16 text-center transition-all duration-200 cursor-pointer relative {getCellClass(actualI, actualJ)}"
                      onmouseenter={() => hoveredCell = [actualI, actualJ]}
                      onmouseleave={() => hoveredCell = null}
                    >
                      <div class="flex flex-col items-center justify-center h-full">
                        <span class="text-sm font-medium">{val}</span>
                        {#if getArrowDirection(actualI, actualJ)}
                          <span class="absolute top-1 left-1 text-xs">{getArrowDirection(actualI, actualJ)}</span>
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
    {/if}
  </div>
</div>

