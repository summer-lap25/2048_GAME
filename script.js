class Game2048 {
            constructor() {
                this.grid = [];
                this.score = 0;
                this.best = parseInt(localStorage.getItem('2048-best')) || 0;
                this.previousState = null;
                this.previousScore = 0;
                this.init();
            }

            init() {
                this.createGrid();
                this.addRandomTile();
                this.addRandomTile();
                this.updateDisplay();
                this.setupEventListeners();
            }

            createGrid() {
                this.grid = Array(4).fill().map(() => Array(4).fill(0));
            }

            addRandomTile() {
                const emptyCells = [];
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.grid[i][j] === 0) {
                            emptyCells.push({row: i, col: j});
                        }
                    }
                }

                if (emptyCells.length > 0) {
                    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
                }
            }

            saveState() {
                this.previousState = JSON.parse(JSON.stringify(this.grid));
                this.previousScore = this.score;
            }

            undoMove() {
                if (this.previousState) {
                    this.grid = JSON.parse(JSON.stringify(this.previousState));
                    this.score = this.previousScore;
                    this.updateDisplay();
                    this.previousState = null;
                }
            }

            move(direction) {
                this.saveState();
                let moved = false;
                const oldGrid = JSON.parse(JSON.stringify(this.grid));

                switch (direction) {
                    case 'up':
                        moved = this.moveUp();
                        break;
                    case 'down':
                        moved = this.moveDown();
                        break;
                    case 'left':
                        moved = this.moveLeft();
                        break;
                    case 'right':
                        moved = this.moveRight();
                        break;
                }

                if (moved) {
                    this.addRandomTile();
                    this.updateDisplay();
                    
                    if (this.isGameOver()) {
                        this.showGameOver();
                    }
                }
            }

            moveLeft() {
                let moved = false;
                for (let i = 0; i < 4; i++) {
                    const row = this.grid[i].filter(cell => cell !== 0);
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            this.score += row[j];
                            row.splice(j + 1, 1);
                            moved = true;
                        }
                    }
                    const newRow = row.concat(Array(4 - row.length).fill(0));
                    if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                        moved = true;
                    }
                    this.grid[i] = newRow;
                }
                return moved;
            }

            moveRight() {
                let moved = false;
                for (let i = 0; i < 4; i++) {
                    const row = this.grid[i].filter(cell => cell !== 0);
                    for (let j = row.length - 1; j > 0; j--) {
                        if (row[j] === row[j - 1]) {
                            row[j] *= 2;
                            this.score += row[j];
                            row.splice(j - 1, 1);
                            moved = true;
                        }
                    }
                    const newRow = Array(4 - row.length).fill(0).concat(row);
                    if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                        moved = true;
                    }
                    this.grid[i] = newRow;
                }
                return moved;
            }

            moveUp() {
                let moved = false;
                for (let j = 0; j < 4; j++) {
                    const column = [];
                    for (let i = 0; i < 4; i++) {
                        if (this.grid[i][j] !== 0) {
                            column.push(this.grid[i][j]);
                        }
                    }
                    for (let i = 0; i < column.length - 1; i++) {
                        if (column[i] === column[i + 1]) {
                            column[i] *= 2;
                            this.score += column[i];
                            column.splice(i + 1, 1);
                            moved = true;
                        }
                    }
                    const newColumn = column.concat(Array(4 - column.length).fill(0));
                    for (let i = 0; i < 4; i++) {
                        if (this.grid[i][j] !== newColumn[i]) {
                            moved = true;
                        }
                        this.grid[i][j] = newColumn[i];
                    }
                }
                return moved;
            }

            moveDown() {
                let moved = false;
                for (let j = 0; j < 4; j++) {
                    const column = [];
                    for (let i = 0; i < 4; i++) {
                        if (this.grid[i][j] !== 0) {
                            column.push(this.grid[i][j]);
                        }
                    }
                    for (let i = column.length - 1; i > 0; i--) {
                        if (column[i] === column[i - 1]) {
                            column[i] *= 2;
                            this.score += column[i];
                            column.splice(i - 1, 1);
                            moved = true;
                        }
                    }
                    const newColumn = Array(4 - column.length).fill(0).concat(column);
                    for (let i = 0; i < 4; i++) {
                        if (this.grid[i][j] !== newColumn[i]) {
                            moved = true;
                        }
                        this.grid[i][j] = newColumn[i];
                    }
                }
                return moved;
            }

            updateDisplay() {
                const gridElement = document.getElementById('grid');
                gridElement.innerHTML = '';

                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        const tile = document.createElement('div');
                        tile.className = 'tile';
                        const value = this.grid[i][j];
                        
                        if (value !== 0) {
                            tile.textContent = value;
                            tile.classList.add(`tile-${value}`);
                        }
                        
                        gridElement.appendChild(tile);
                    }
                }

                document.getElementById('score').textContent = this.score;
                if (this.score > this.best) {
                    this.best = this.score;
                    localStorage.setItem('2048-best', this.best);
                }
                document.getElementById('best').textContent = this.best;
            }

            isGameOver() {
                // Check if there are empty cells
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.grid[i][j] === 0) return false;
                    }
                }

                // Check if any merges are possible
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        const current = this.grid[i][j];
                        if (j < 3 && this.grid[i][j + 1] === current) return false;
                        if (i < 3 && this.grid[i + 1][j] === current) return false;
                    }
                }

                return true;
            }

            showGameOver() {
                document.getElementById('gameOver').classList.add('show');
            }

            setupEventListeners() {
                let startX, startY, endX, endY;
                const minSwipeDistance = 50;

                // Touch events for mobile
                document.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                });

                document.addEventListener('touchend', (e) => {
                    endX = e.changedTouches[0].clientX;
                    endY = e.changedTouches[0].clientY;
                    
                    const deltaX = endX - startX;
                    const deltaY = endY - startY;
                    
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        if (Math.abs(deltaX) > minSwipeDistance) {
                            if (deltaX > 0) {
                                this.move('right');
                            } else {
                                this.move('left');
                            }
                        }
                    } else {
                        if (Math.abs(deltaY) > minSwipeDistance) {
                            if (deltaY > 0) {
                                this.move('down');
                            } else {
                                this.move('up');
                            }
                        }
                    }
                });

                // Keyboard events
                document.addEventListener('keydown', (e) => {
                    switch (e.key) {
                        case 'ArrowUp':
                            e.preventDefault();
                            this.move('up');
                            break;
                        case 'ArrowDown':
                            e.preventDefault();
                            this.move('down');
                            break;
                        case 'ArrowLeft':
                            e.preventDefault();
                            this.move('left');
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            this.move('right');
                            break;
                    }
                });
            }
        }

        // Global functions for button controls
        let game;

        function newGame() {
            game = new Game2048();
            document.getElementById('gameOver').classList.remove('show');
        }

        function undoMove() {
            if (game) {
                game.undoMove();
            }
        }

        function moveUp() {
            if (game) game.move('up');
        }

        function moveDown() {
            if (game) game.move('down');
        }

        function moveLeft() {
            if (game) game.move('left');
        }

        function moveRight() {
            if (game) game.move('right');
        }

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            game = new Game2048();
        });