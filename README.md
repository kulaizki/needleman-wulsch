# Needleman-Wunsch Algorithm Visualizer

An interactive web-based visualization tool for the Needleman-Wunsch global sequence alignment algorithm, built with SvelteKit and TypeScript.

## Features

- **Interactive Matrix Visualization** - Real-time dynamic programming matrix with traceback path highlighting
- **Custom Scoring Parameters** - Adjustable match, mismatch, and gap penalty scores
- **Educational Tooltips** - Detailed score calculations on hover

## Getting Started

```bash
# Clone the repository
git clone https://github.com/kulaizki/needleman-wunsch.git
cd needleman-wunsch

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Usage

1. Enter two sequences to align in the input fields
2. Adjust scoring parameters:
   - **Match Score**: Points for matching characters (default: 1)
   - **Mismatch Score**: Penalty for different characters (default: -1)
   - **Gap Score**: Penalty for insertions/deletions (default: -2)
3. Click "Run Alignment" to visualize the algorithm
4. Hover over matrix cells to see calculation details
5. The optimal alignment path is highlighted in the matrix

## Tech Stack

- **SvelteKit** - Full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool

## License

MIT License - see [LICENSE](LICENSE) file for details