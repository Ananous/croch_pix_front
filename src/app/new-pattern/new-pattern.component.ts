import {Component, computed, inject, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ButtonComponent} from '../shared/components/button/button.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-pattern',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ButtonComponent],
  templateUrl: './new-pattern.component.html',
  styleUrls: ['./new-pattern.component.scss']
})
export class NewPatternComponent {
  selectedColor = signal<string>('#000000');
  isPainting = signal<boolean>(false);
  grid = signal<string[][]>(
    Array(16).fill('').map(() => Array(16).fill('#ffffff'))
  );
  history = signal<string[][][]>([]);
  historyIndex = signal<number>(-1);
  canUndo = computed(() => this.historyIndex() > 0);
  canRedo = computed(() => this.historyIndex() < this.history().length - 1);
  usedColors = computed(() => {
    const uniqueColors = new Set<string>();
    this.grid().forEach(row => row.forEach(cell => {
      if (cell !== '#ffffff') uniqueColors.add(cell);
    }));
    return Array.from(uniqueColors);
  });

  constructor() {
    this.saveState();
  }
  private router = inject(Router);


  goToHome() {
    this.router.navigate(['/home']);
  }

  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedColor.set(input.value);
  }

  selectUsedColor(color: string) {
    this.selectedColor.set(color);
  }

  startPainting(rowIndex: number, colIndex: number) {
    this.isPainting.set(true);
    this.paintCell(rowIndex, colIndex);
  }

  stopPainting() {
    if (this.isPainting()) {
      this.isPainting.set(false);
      this.saveState();
    }
  }

  hoverPaint(rowIndex: number, colIndex: number) {
    if (this.isPainting()) {
      this.paintCell(rowIndex, colIndex);
    }
  }

  private paintCell(row: number, col: number) {
    // 1. On récupère la grille actuelle
    const currentGrid = this.grid();

    if (currentGrid[row][col] === this.selectedColor()) return;

    const newGrid = currentGrid.map(r => [...r]);
    newGrid[row][col] = this.selectedColor();

    this.grid.set(newGrid);
  }

  saveState() {
    const currentGridCopy = JSON.parse(JSON.stringify(this.grid()));
    const currentIndex = this.historyIndex();
    const currentHistory = this.history();
    const newHistory = currentHistory.slice(0, currentIndex + 1);

    newHistory.push(currentGridCopy);

    this.history.set(newHistory);
    this.historyIndex.set(newHistory.length - 1);
  }

  undo() {
    if (this.canUndo()) {
      this.historyIndex.update(i => i - 1);
      this.grid.set(JSON.parse(JSON.stringify(this.history()[this.historyIndex()])));
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex.update(i => i + 1);
      this.grid.set(JSON.parse(JSON.stringify(this.history()[this.historyIndex()])));
    }
  }

  clearGrid() {
    const whiteGrid = Array(16).fill('').map(() => Array(16).fill('#ffffff'));
    this.grid.set(whiteGrid);
    this.saveState();
    this.selectedColor.set('#000000');
  }
}
