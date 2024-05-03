function handleCheckboxChange(checkbox) {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    if (cb !== checkbox) {
      cb.checked = false;
    }
  });

  const managerInput = document.getElementById("managerInput");
  managerInput.value = checkbox.checked ? checkbox.value : "";
}
