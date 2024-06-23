
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const sqaureElement = document.createElement("div");
            sqaureElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");
            sqaureElement.dataset.row = rowindex;
            sqaureElement.dataset.col = squareindex;
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                sqaureElement.appendChild(pieceElement);

            }
            sqaureElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });
            sqaureElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(sqaureElement.dataset.row),
                        col: parseInt(sqaureElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);

                }
            });
            boardElement.appendChild(sqaureElement);
        })

    });
    if(playerRole==='b')
        {
            boardElement.classList.add("flipped");
        }
        else{
            boardElement.classList.remove("flipped");
        }
          
};
const handleMove = (source, target) => {
    let promotionPiece = null;

    if (source.row === 1 && target.row === 0 || source.row === 6 && target.row === 7) {
      
        const promotionOptions = {
            q: 'Queen',
            r: 'Rook',
            b: 'Bishop',
            n: 'Knight'
        };

        let message = 'Promote to:\n';
        for (const key in promotionOptions) {
            message += `${key} - ${promotionOptions[key]}\n`;
        }
        message += 'Enter the letter corresponding to your choice (q, r, b, n):';

        // Prompt the user
        promotionPiece = window.prompt(message, 'q');

        // Ensure the user input is valid
        if (!['q', 'r', 'b', 'n'].includes(promotionPiece)) {
            promotionPiece = 'q'; // Default to queen if invalid input
        }
    }

    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: promotionPiece || undefined, // Only include promotion if it's set
    };

    socket.emit("move", move);
};


const getPieceUnicode = (piece) => {
    const unicodePieces = {
        K: "♔",
        Q: "♕",
        R: "♖",
        B: "♗",
        N: "♘",
        P: "\u265F",
        k: "♚",
        q: "♛",
        r: "♜",
        b: "♝",
        n: "♞",
        p: "\u2659",
    };
    return unicodePieces[piece.type] || "";
};
socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard();
});
socket.on("spectatorRole",function(){
    playerRole=null;
    renderBoard();
});

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
});
renderBoard();
