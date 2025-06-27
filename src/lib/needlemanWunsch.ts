export interface AlignmentResult {
  alignedSeq1: string;
  alignedSeq2: string;
  score: number;
  matrix: number[][];
  traceback: [number, number][];
}

export interface AlignmentParams {
  seq1: string;
  seq2: string;
  matchScore: number;
  mismatchScore: number;
  gapScore: number;
}

export function needlemanWunsch({
  seq1,
  seq2,
  matchScore,
  mismatchScore,
  gapScore
}: AlignmentParams): AlignmentResult {
  const m = seq1.length;
  const n = seq2.length;
  
  // Initialize matrix
  const matrix: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Fill first row and column
  for (let i = 0; i <= m; i++) {
    matrix[i][0] = i * gapScore;
  }
  for (let j = 0; j <= n; j++) {
    matrix[0][j] = j * gapScore;
  }
  
  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = matrix[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? matchScore : mismatchScore);
      const deleteGap = matrix[i - 1][j] + gapScore;
      const insertGap = matrix[i][j - 1] + gapScore;
      
      matrix[i][j] = Math.max(match, deleteGap, insertGap);
    }
  }
  
  // Traceback
  const traceback: [number, number][] = [];
  let i = m;
  let j = n;
  let alignedSeq1 = '';
  let alignedSeq2 = '';
  
  while (i > 0 || j > 0) {
    traceback.push([i, j]);
    
    if (i === 0) {
      alignedSeq1 = '-' + alignedSeq1;
      alignedSeq2 = seq2[j - 1] + alignedSeq2;
      j--;
    } else if (j === 0) {
      alignedSeq1 = seq1[i - 1] + alignedSeq1;
      alignedSeq2 = '-' + alignedSeq2;
      i--;
    } else {
      const current = matrix[i][j];
      const diagonal = matrix[i - 1][j - 1];
      const up = matrix[i - 1][j];
      const left = matrix[i][j - 1];
      
      const matchScore_ = diagonal + (seq1[i - 1] === seq2[j - 1] ? matchScore : mismatchScore);
      
      if (current === matchScore_) {
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        i--;
        j--;
      } else if (current === up + gapScore) {
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = '-' + alignedSeq2;
        i--;
      } else {
        alignedSeq1 = '-' + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        j--;
      }
    }
  }
  
  traceback.push([0, 0]);
  traceback.reverse();
  
  return {
    alignedSeq1,
    alignedSeq2,
    score: matrix[m][n],
    matrix,
    traceback
  };
}