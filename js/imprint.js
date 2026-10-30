
document.getElementById("historyBack").addEventListener("click", goBack);


function goBack(event) {
    event.preventDefault();
    history.back();
}
