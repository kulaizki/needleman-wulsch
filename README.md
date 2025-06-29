# Needleman-Wunsch Algorithm Visualizer

An interactive web-based visualization tool for the Needleman-Wunsch global sequence alignment algorithm, built with SvelteKit and TypeScript.

🔗 **[Live Demo](https://neewunsch.vercel.app/)**

## Features

- **Interactive Matrix Visualization** - Real-time dynamic programming matrix with traceback path highlighting
- **Custom Scoring Parameters** - Adjustable match, mismatch, and gap penalty scores
- **Educational Tooltips** - Detailed score calculations on hover

## Usage

Visit [https://neewunsch.vercel.app/](https://neewunsch.vercel.app/) to use the application directly in your browser.

1. Enter two sequences to align in the input fields
2. Adjust scoring parameters:
   - **Match Score**: Points for matching characters (default: 1)
   - **Mismatch Score**: Penalty for different characters (default: -1)
   - **Gap Score**: Penalty for insertions/deletions (default: -2)
3. Click "Run Alignment" to visualize the algorithm
4. Hover over matrix cells to see calculation details
5. The optimal alignment path is highlighted in the matrix