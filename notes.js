
// I can't remember for the life of me why I called this "notes.js". 
// Make it make sense. 

function toggleSolution(button) {
    const solutionDiv = button.nextElementSibling;
    const isVisible = solutionDiv.style.display === "block";
    solutionDiv.style.display = isVisible ? "none" : "block";
    button.textContent = isVisible ? "Show Solution" : "Hide Solution";
}