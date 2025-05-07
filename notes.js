
function toggleSolution(button) {
    const solutionDiv = button.nextElementSibling;
    const isVisible = solutionDiv.style.display === "block";
    solutionDiv.style.display = isVisible ? "none" : "block";
    button.textContent = isVisible ? "Show Solution" : "Hide Solution";
}