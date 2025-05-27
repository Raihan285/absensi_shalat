const links = document.querySelectorAll(".menu-1 a");
const currentUrl = window.location.href;

links.forEach(link => {
  if (link.href === currentUrl) {
    link.classList.add("active");
  }
});