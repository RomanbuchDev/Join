function toggleUserMenu(button) {
  const userMenu = document.querySelector("#user-menu-dropdown");
  userMenu.classList.toggle("is-open");
  const isOpen = userMenu.classList.contains("is-open");
  button.setAttribute("aria-expanded", isOpen);
}
