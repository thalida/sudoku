export const BOARD_SIZE = 9;
export type TBoard = number[];

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function validateCell(
  board: TBoard,
  cellIdx: number,
  value: number
): boolean {
  const cellRow = Math.floor(cellIdx / BOARD_SIZE);
  const cellCol = cellIdx % BOARD_SIZE;

  const rowValues = board.slice(
    cellRow * BOARD_SIZE,
    (cellRow + 1) * BOARD_SIZE
  );
  if (rowValues.includes(value)) {
    return false;
  }

  const colValues = board.filter((_, i) => i % BOARD_SIZE === cellCol);
  if (colValues.includes(value)) {
    return false;
  }

  const squareValues = board.filter(
    (_, i) =>
      Math.floor(i / BOARD_SIZE) >= cellRow - (cellRow % 3) &&
      Math.floor(i / BOARD_SIZE) < cellRow - (cellRow % 3) + 3 &&
      i % BOARD_SIZE >= cellCol - (cellCol % 3) &&
      i % BOARD_SIZE < cellCol - (cellCol % 3) + 3
  );
  if (squareValues.includes(value)) {
    return false;
  }

  return true;
}

export function getCellCandidates(
  board: TBoard,
  cell: number,
  invalidCandidates: number[] = []
): number[] {
  const cellRow = Math.floor(cell / BOARD_SIZE);
  const cellCol = cell % BOARD_SIZE;

  const rowValues = board.slice(
    cellRow * BOARD_SIZE,
    (cellRow + 1) * BOARD_SIZE
  );
  const colValues = board.filter((_, i) => i % BOARD_SIZE === cellCol);
  const squareValues = board.filter(
    (_, i) =>
      Math.floor(i / BOARD_SIZE) >= cellRow - (cellRow % 3) &&
      Math.floor(i / BOARD_SIZE) < cellRow - (cellRow % 3) + 3 &&
      i % BOARD_SIZE >= cellCol - (cellCol % 3) &&
      i % BOARD_SIZE < cellCol - (cellCol % 3) + 3
  );
  const possibleValues = [...new Array(BOARD_SIZE).keys()]
    .map((i) => i + 1)
    .filter(
      (i) =>
        !rowValues.includes(i) &&
        !colValues.includes(i) &&
        !squareValues.includes(i) &&
        !invalidCandidates?.includes(i)
    );

  return possibleValues;
}

export function generateRandomBoard(): TBoard {
  const openCells = [...new Array(BOARD_SIZE * BOARD_SIZE).keys()];
  const touchedCells: number[] = [];
  const invalidCandidates: { [key: number]: number[] } = {};
  const board = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

  while (openCells.length > 0) {
    const randomCell = openCells[0];
    const candidates = getCellCandidates(
      board,
      randomCell,
      invalidCandidates[randomCell]
    );

    if (candidates.length === 0) {
      const lastTouchedCell = touchedCells.pop();
      if (lastTouchedCell) {
        if (typeof invalidCandidates[lastTouchedCell] === "undefined") {
          invalidCandidates[lastTouchedCell] = [];
        }

        invalidCandidates[lastTouchedCell].push(board[lastTouchedCell]);
        invalidCandidates[randomCell] = [];
        board[lastTouchedCell] = 0;
        openCells.unshift(lastTouchedCell);
      }
      continue;
    }

    const randomValue = randomItem(candidates);
    board[randomCell] = randomValue;
    openCells.splice(openCells.indexOf(randomCell), 1);
    touchedCells.push(randomCell);
  }

  return board;
}

export function generatePuzzle(board: TBoard): any {
  const boardCopy = board.slice(0);
  const visibleCells = shuffle([...new Array(BOARD_SIZE * BOARD_SIZE).keys()]);
  const targetVisibleCells = 17;

  let currCell = 0;
  while (
    currCell < visibleCells.length &&
    visibleCells.length > targetVisibleCells
  ) {
    const randomCell = visibleCells[currCell];
    const origValue = board[randomCell];
    boardCopy[randomCell] = 0;

    const res = solveBoard(boardCopy.slice(0));
    const numSolutions = res.solutions.length;

    if (numSolutions > 1) {
      console.log(res, res.solutions, numSolutions);
      for (let i = 0; i < res.solutions.length; i++) {
        console.log(res.solutions[i][randomCell]);
      }
      boardCopy[randomCell] = origValue;
      currCell += 1;
      continue;
    }

    visibleCells.splice(currCell, 1);
  }

  if (visibleCells.length > targetVisibleCells) {
    console.warn("retrying", visibleCells.length);
    return generatePuzzle(board);
  }

  console.log("board", board);
  console.log(board.includes(0));
  console.log("boardCopy", boardCopy);
  console.log(boardCopy.includes(0));
  console.log("visibleCells", visibleCells);
  console.log(currCell);

  return { board: boardCopy, visibleCells };
}

export function generateBoard() {
  const board = generateRandomBoard();
  console.log(board.includes(0));
  // const puzzle = generatePuzzle(board);
  // return puzzle;
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function solveBoard(board: TBoard): any {
  const emptyCellIdx = board.findIndex((cell) => cell === 0);
  let isSolved = false;
  if (emptyCellIdx === -1) {
    isSolved = true;
    return {
      isSolved,
      board: board.slice(0),
    };
  }

  const candidates = getCellCandidates(board, emptyCellIdx);

  const foundSolutions: TBoard[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    board[emptyCellIdx] = candidate;

    const solution = solveBoard(board.slice(0));

    if (solution.isSolved) {
      isSolved = true;
      foundSolutions.push(solution.board);
    }

    if (foundSolutions.length > 1) {
      console.log(emptyCellIdx, i, foundSolutions);
      break;
    }
  }

  return { isSolved, board, solutions: foundSolutions };
}
