import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Player = 'X' | 'O';
type Cell = Player | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  /** Board state (9 cells). */
  board: ReadonlyArray<Cell> = Array.from({ length: 9 }, () => null);

  /** Current player whose turn it is. */
  currentPlayer: Player = 'X';

  /** Winner (if any). */
  winner: Player | null = null;

  /** Whether the game ended in a draw. */
  isDraw = false;

  /** True when winner or draw is reached (locks the board). */
  get gameOver(): boolean {
    return this.winner !== null || this.isDraw;
  }

  // PUBLIC_INTERFACE
  resetGame(): void {
    /** Resets the entire game state to start a new match. */
    this.board = Array.from({ length: 9 }, () => null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.isDraw = false;
  }

  // PUBLIC_INTERFACE
  makeMove(index: number): void {
    /** Applies a move for the current player at the given cell index. */
    if (this.gameOver) return;
    if (!Number.isInteger(index) || index < 0 || index > 8) return;

    // Prevent overwriting an existing move.
    if (this.board[index] !== null) return;

    // Create a new immutable board snapshot for strict change detection friendliness.
    const nextBoard: Cell[] = [...this.board];
    nextBoard[index] = this.currentPlayer;
    this.board = nextBoard;

    // Evaluate game state after the move.
    const computedWinner = this.computeWinner(this.board);
    if (computedWinner) {
      this.winner = computedWinner;
      return;
    }

    if (this.board.every((c) => c !== null)) {
      this.isDraw = true;
      return;
    }

    // Toggle player.
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }

  // PUBLIC_INTERFACE
  getCellAriaLabel(index: number): string {
    /** Provides an accessible label for each cell. */
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const value = this.board[index];
    return value ? `Row ${row}, Column ${col}, ${value}` : `Row ${row}, Column ${col}, empty`;
  }

  private computeWinner(board: ReadonlyArray<Cell>): Player | null {
    /**
     * Checks all possible winning lines and returns the winning player, if any.
     * Lines: 3 rows, 3 columns, 2 diagonals.
     */
    const lines: ReadonlyArray<readonly [number, number, number]> = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      const v = board[a];
      if (v !== null && v === board[b] && v === board[c]) return v;
    }
    return null;
  }
}
