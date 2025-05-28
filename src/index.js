const links = document.querySelectorAll(".menu-1 a");
const currentUrl = window.location.href;

links.forEach(link => {
  if (link.href === currentUrl) {
    link.classList.add("active");
  }
});

function showSidebar() {
  const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'block'
}

function hideSidebar() {
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'none'
}