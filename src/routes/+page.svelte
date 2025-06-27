<script lang="ts">
  import { needlemanWunsch, type AlignmentResult } from '$lib/needlemanWunsch';
  
  let seq1 = $state('GATTACA');
  let seq2 = $state('GCATGCU');
  let matchScore = $state(1);
  let mismatchScore = $state(-1);
  let gapScore = $state(-1);
  
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
  }
  
  function getCellClass(i: number, j: number): string {
    if (!result) return '';
    
    const isOnPath = result.traceback.some(([pi, pj]) => pi === i && pj === j);
    const isHovered = hoveredCell && hoveredCell[0] === i && hoveredCell[1] === j;
    
    if (isOnPath) return 'bg-rose-500 text-white';
    if (isHovered) return 'bg-blue-200';
    if (i === 0 || j === 0) return 'bg-gray-100 font-semibold';
    return 'hover:bg-gray-50';
  }
  
  function getCellValue(i: number, j: number): string {
    if (!result) return '';
    if (i === 0 && j === 0) return '';
    if (i === 0 && j > 0) return seq2[j - 1];
    if (j === 0 && i > 0) return seq1[i - 1];
    return result.matrix[i][j].toString();
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
              <p>• Gray cells represent sequence headers</p>
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
              {#each result.matrix as row, i}
                <tr>
                  {#each row as _, j}
                    <td
                      class="border border-gray-300 w-16 h-16 text-center transition-all duration-200 cursor-pointer {getCellClass(i, j)}"
                      onmouseenter={() => hoveredCell = [i, j]}
                      onmouseleave={() => hoveredCell = null}
                    >
                      {getCellValue(i, j)}
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

