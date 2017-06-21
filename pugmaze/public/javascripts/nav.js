function goLeft() {
    window.location.href = left;
}
function goBackward() {
    if (backward) {
        window.location.href = backward;
    }
}
function goRight() {
    window.location.href = right;
}
function goForward() {
    if (forward) {
        window.location.href = forward;
    }
}

function keyDown(event) {
    switch (event.key) {
    case 'w':
        goForward();
        break;
    case 'a':
        goLeft();
        break;
    case 's':
        goBackward();
        break;
    case 'd':
        goRight();
        break;
    }
}
addEventListener("keydown", keyDown);
