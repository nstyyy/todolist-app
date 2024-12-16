// Gestionnaire d'événement pour le formulaire de connexion
const form = document.getElementById('loginForm');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Empêche le rechargement de la page

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok) {
      messageEl.style.color = 'green';
      messageEl.textContent = result.message;

      // Sauvegarder l'ID utilisateur dans le localStorage
      localStorage.setItem('userId', result.userId);

      // Rediriger vers le tableau de bord
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000); // Redirection après 1 seconde pour afficher le message
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message;
    }
  } catch (error) {
    console.error('Erreur :', error);
    messageEl.textContent = 'Erreur lors de la connexion.';
  }
});